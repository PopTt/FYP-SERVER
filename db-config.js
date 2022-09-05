const mongoose = require('mongoose')

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

var db = mongoose.connect(process.env.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('DB Connected')
}).catch((e) => {
    console.log(e)
})

module.exports = db;