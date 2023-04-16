const schema = require("../../models/Schemas");
const bcrypt = require("bcrypt");
const CryptoJS = require("crypto-js");
const faceapi = require("face-api.js");
const { createCanvas, loadImage, ImageData, Canvas, Image } = require("canvas");
const fetch = require("node-fetch");
const { Blob } = require("buffer");

let model;
//const tf = require('@tensorflow/tfjs-node');
//require('@tensorflow/tfjs-node');
// const jsdom = require('jsdom');
// const { JSDOM } = jsdom;
// const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
// const { window, document } = dom;

faceapi.env.monkeyPatch({ Canvas, Image, ImageData, fetch, Blob });
// faceapi.env.monkeyPatch({
//     fetch: fetch,
//     Canvas: window.HTMLCanvasElement,
//     Image: window.HTMLImageElement,
//     ImageData: ImageData,
//     createCanvasElement: () => document.createElement('canvas'),
//     createImageElement: () => document.createElement('img')
// });

const MODEL_URL = `${__dirname}/../../faceapi/`;

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL),
  faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL),
]).then(console.log("models loaded"));

// async function trainModel(imageDataArray) {
//     const images = imageDataArray.map(base64data => {
//       const buffer = Buffer.from(base64data, 'base64');
//       const decodedImage = tf.node.decodeImage(buffer);
//       const resizedImage = tf.image.resizeBilinear(decodedImage, [160, 160]);
//       return resizedImage;
//     });

//     const labels = imageDataArray.map((_, i) => i);

//     const model = tf.sequential();
//     model.add(tf.layers.conv2d({
//       inputShape: [160, 160, 3],
//       filters: 32,
//       kernelSize: 3,
//       activation: 'relu'
//     }));
//     model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
//     model.add(tf.layers.flatten());
//     model.add(tf.layers.dense({ units: imageDataArray.length, activation: 'softmax' }));

//     model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy' });

//     const faceMatcher = {
//       match: async (base64data) => {
//         const buffer = Buffer.from(base64data, 'base64');
//         const decodedImage = tf.node.decodeImage(buffer);
//         const resizedImage = tf.image.resizeBilinear(decodedImage, [160, 160]);
//         const tensor = tf.stack([resizedImage]);
//         const output = await model.predict(tensor).data();
//         const prediction = Array.from(output).indexOf(Math.max(...output));
//         return imageDataArray[prediction];
//       }
//     };

//     return faceMatcher;
//   }

async function encryptModel(model, secret) {
  const key = CryptoJS.enc.Utf8.parse(secret);
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(model), key, {
    mode: CryptoJS.mode.ECB,
  });
  return encrypted.toString();
}

module.exports = {
  register: async (req, res, next) => {
    const body = req.body;
    try {
      const salt = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(body.password, salt);
      await schema.Users.create(
        {
          username: body.username,
          email: body.email,
          password: hashPass,
          type: body.type,
        },
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              success: 0,
              message: "Server connection failure",
            });
          }
          return res.status(201).json({
            success: 1,
            message: "Register Successfully",
            data: result,
          });
        }
      );
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    const { email, password, type } = req.body;
    try {
      const user = await schema.Users.findOne({
        email: email,
        type: type,
      });
      if (user) {
        const checkPass = bcrypt.compareSync(password, user.password);
        if (checkPass) {
          return res.status(200).json({
            success: 1,
            message: "Login successfully",
            data: user,
          });
        } else {
          return res.status(401).json({
            success: 0,
            message: "Invalid username or password",
          });
        }
      } else {
        return res.status(401).json({
          success: 0,
          message: "User does not exist",
        });
      }
    } catch (error) {
      next(error);
    }
  },

  registerFace: async (req, res, next) => {
    const imageDataArray = req.body.imageURIs;
    const user_id = req.body.user_id;
    const secret = req.body.secret;

    try {
      // Convert base64 image data to ImageData
      const imageDatas = await Promise.all(
        imageDataArray.map(async (imageData) => {
          const image = await loadImage(Buffer.from(imageData, "base64"));
          const canvas = createCanvas(image.width, image.height);
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, image.width, image.height);
          return canvas;
        })
      );

      // Train the face recognition model on the images
      const labeledDescriptors = await Promise.all(
        imageDatas.slice(0, -1).map(async (imageData) => {
          const detections = await faceapi
            .detectSingleFace(imageData)
            .withFaceLandmarks()
            .withFaceDescriptor();
          const descriptor = detections.descriptor;
          return new faceapi.LabeledFaceDescriptors(user_id, [descriptor]);
        })
      );
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);

      // Test the model on the last image
      const testImage = imageDatas.slice(-1)[0];
      const detection = await faceapi.detectSingleFace(testImage)
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (detection) {
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        console.log(`Best match for user ${user_id} is ${bestMatch.toString()}`);
      } else {
        console.log(`No face detected in test image for user ${user_id}`);
      }
      // Encrypt the face recognition model
      // const modelJson = faceapi.serializeFaceMatcher(faceMatcher);
      // const key = CryptoJS.enc.Utf8.parse(secret);
      // const iv = CryptoJS.lib.WordArray.random(16);
      // const cipherText = CryptoJS.AES.encrypt(modelJson, key, { iv: iv });
      model = faceMatcher;
      const encryptedModel = await encryptModel(faceMatcher, secret);

      console.log(model);

      const updatedUser = await schema.Users.findByIdAndUpdate(
        user_id,
        { faceModel: encryptedModel },
        { new: true }
      );

      // Send response with the updated user object
      res.status(200).json({
        success: 1,
        message: "Face registered successfully",
        data: updatedUser,
      });
    } catch (error) {
      res.status(201).json({
        success: 0,
        message: "Fail to register the face",
        data: updatedUser,
      });
    }
  },

  recognizeFace: async (req, res, next) => {
    const faceImage = req.body.faceImage;
    const userId = req.body.userId;
    const secret = req.body.secret;

    try {
      // Retrieve the face model from MongoDB based on the user ID
      const user = await schema.Users.findById(userId);
      const encryptedModel = user.faceModel;
      if (!encryptedModel) {
        return res.status(400).json({
          success: 0,
          message: "No face model found for the provided user ID",
        });
      }

      // Decrypt the model
      // const key = CryptoJS.enc.Utf8.parse(secret);
      // console.log("key:: " + key.toString())
      // const modelString = encryptedModel.toString('utf-8');
      // const decryptedWordArray = CryptoJS.AES.decrypt(modelString, key, {
      //   mode: CryptoJS.mode.ECB,
      // });
      // console.log("decryptedWordArray:: " + JSON.stringify(decryptedWordArray))
      // const decryptedStr = decryptedWordArray.toString(CryptoJS.enc.Utf8);
      // console.log("decryptedStr:: " + decryptedStr)
      // const deserialized = JSON.parse(decryptedStr);
      //const faceMatcher = new faceapi.FaceMatcher(decryptedWordArray);

      // Process the face image
      console.log("model:: " + model)
      const image = await loadImage(Buffer.from(faceImage, "base64"));
      const canvas = createCanvas(image.width, image.height);
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, image.width, image.height);
      const detections = await faceapi
        .detectSingleFace(canvas)
        .withFaceLandmarks()
        .withFaceDescriptor();
      const descriptor = detections.descriptor;

      // Match the face descriptor to a known user ID
      const match = model.findBestMatch(descriptor);

      return res.status(200).json({
        success: 1,
        message: "Face recognition successful",
        data: match.toString(),
      });
      
    } catch (error) {
        console.log(error)
      res.status(500).json({
        success: 0,
        message: "Failed to recognize the face",
        error: error.message,
      });
    }
  },
};
