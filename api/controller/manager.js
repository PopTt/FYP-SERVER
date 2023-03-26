const schema = require('../../models/Schemas')

module.exports = {
    assignUser: async (req, res, next) => {
        const body = req.body;
        try {         
            const result = await schema.Events.findByIdAndUpdate(   
                body.event_id,
            {
                $push :{
                    participants: {
                        "id": body.user_id,
                    }
                }
            })
            return res.status(201).json({
                success: 1,
                message: 'assign User Successfully',
                data: result,
            })
        } catch (error) {
            next(error)
        }        
    },

    updateAttendance: async (req, res, next) => {
        const body = req.body;
        try {         
            const result = await schema.Events.updateOne(   
            {
                "_id": body.event_id,
                "participants.id": body.user_id
            },
            {               
                $set: {
                    'participants.$.status': body.status,
                }
            })
            return res.status(201).json({
                success: 1,
                message: 'update attendance Successfully',
                data: result,
            })
        } catch (error) {
            next(error)
        }        
    },

    setLocation: async (req, res, next) => {
        const body = req.body;
        try {         
            const result = await schema.Events.updateOne(   
            {
                "_id": body.event_id,
            },
            {               
                $set: {
                    'location': body.location,
                }
            })
            return res.status(201).json({
                success: 1,
                message: 'set Location Successfully',
                data: result,
            })
        } catch (error) {
            next(error)
        }        
    },

}