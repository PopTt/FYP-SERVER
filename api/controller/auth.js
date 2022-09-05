const schema = require('../../models/Schemas')
const bcrypt = require('bcrypt');

module.exports = {
    register: async (req, res, next) => {
        const body = req.body;
        try {
                const salt = bcrypt.genSaltSync(10);
                const hashPass = bcrypt.hashSync(body.password, salt)
                await schema.Users.create({
                    username: body.username,
                    email: body.email,
                    password: hashPass,
                    type: body.type
                }, (err, result) => {
                    if(err){
                        console.log(err)
                        return res.status(500).json({
                            success: 0,
                            message: 'Server connection failure'
                        })
                    }
                    return res.status(201).json({
                        success: 1,
                        message: 'Register Successfully',
                        data: result,
                    })
            })
        } catch (error) {
            next(error)
        }
    },

    login: async (req, res, next) => {
        const {email, password, type} = req.body;
        try {
            const user = await schema.Users.findOne(
                {
                    email: email,
                    type: type
                }
                )
            if(user){
                const checkPass = bcrypt.compareSync(password, user.password)
                    if(checkPass){
                        return res.status(200).json({
                            success: 1,
                            message: 'Login successfully',
                            data: user,
                          });
                    }else{
                        return res.status(401).json({
                            success: 0,
                            message: 'Invalid username or password',
                          });
                    }
            }else{
                return res.status(401).json({
                    success: 0,
                    message: 'User does not exist',
                })
            }
        } catch (error) {
            next(error)
        }
    }
}