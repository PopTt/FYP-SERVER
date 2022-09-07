const schema = require('../../models/Schemas')
const bcrypt = require('bcrypt');

module.exports = {
    createOrganization: async (req, res, next) => {
        const body = req.body;
        try {
            await schema.Organizations.create({
                name: body.name,
                description: body.description,
                admin: [body.admin]
            },
            (err, result) => {
                if(err){
                    console.log(err)
                    return res.status(500).json({
                        success: 0,
                        message: 'Server connection failure'
                    })
                }
                return res.status(201).json({
                    success: 1,
                    message: 'Create Organization Successfully',
                    data: result,
                })
        })
        } catch (error) {
            next(error)
        }                
    },

    createManager: async (req, res, next) => {
        const body = req.body;
        const salt = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(body.password, salt)
        await schema.Users.create({
            username: body.username,
            email: body.email,
            password: hashPass,
            type: "Manager"
        },(err, result) => {
            if(err){
                console.log(err)
                return res.status(500).json({
                    success: 0,
                    message: 'Server connection failure'
                })
            }

            schema.Organizations.findByIdAndUpdate(   
                body.organization_id,
            {
                $push :{
                    managers: {
                        "id": result._id,
                    }
                }
            },(err, result) => {
                return res.status(201).json({
                    success: 1,
                    message: 'Create Manager Successfully',
                    data: result,
                })
            })
        })

    },

    createEvent: async (req, res, next) => {
        const body = req.body;
        try {
            await schema.Events.create({
                name: body.name,
                description: body.description,
                invitationPin: body.invitationPin,
                method: body.method,
                organization: body.organization
            },
            (err, result) => {
                if(err){
                    console.log(err)
                    return res.status(500).json({
                        success: 0,
                        message: 'Server connection failure'
                    })
                }
                return res.status(201).json({
                    success: 1,
                    message: 'Create Event Successfully',
                    data: result,
                })
        })
        } catch (error) {
            next(error)
        }             
    },

    assignManager: async (req, res, next) => {
        const body = req.body;
        try {         
            const result = await schema.Events.findByIdAndUpdate(   
                body.event_id,
            {
                $push :{
                    managers: {
                        "id": body.manager_id,
                        "name": body.manager_name,
                        "creator": body.admin_id
                    }
                }
            })
            return res.status(201).json({
                success: 1,
                message: 'assign Manager Successfully',
                data: result,
            })
        } catch (error) {
            next(error)
        }        
    },

    closeEvent: async (req, res, next) => {
        const body = req.body;
        try {         
            const result = await schema.Events.findByIdAndUpdate(   
                body.event_id,
            {
                $set: {
                    status: true
                }
            })
            return res.status(201).json({
                success: 1,
                message: 'Close Event Successfully',
                data: result,
            })
        } catch (error) {
            next(error)
        }        
    },
    openEvent: async (req, res, next) => {
        const body = req.body;
        try {         
            const result = await schema.Events.findByIdAndUpdate(   
                body.event_id,
            {
                $set: {
                    status: false
                }
            })
            return res.status(201).json({
                success: 1,
                message: 'Open Event Successfully',
                data: result,
            })
        } catch (error) {
            next(error)
        }        
    },
}