const schema = require('../../models/Schemas')

module.exports = {
    signAttendance: async (req, res, next) => {
        const body = req.body;
        try {         
            const result = await schema.Events.updateOne(   
            {
                "_id": body.event_id,
                "participants.id": body.user_id
            },
            {               
                $set: {
                    'participants.$.status': 'Attend',
                    'participants.$.location': body.location,
                    'participants.$.IPAddress': body.IPAddress
                }
            })
            return res.status(201).json({
                success: 1,
                message: 'sign attendance Successfully',
                data: result,
            })
        } catch (error) {
            next(error)
        }        
    },

    joinEvent: async (req, res, next) => {
        const body = req.body;
        try {         
            const result = await schema.Events.updateOne(   
            {
                "invitationPin": body.invitationPin,
            },
            {               
                $push :{
                    participants: {
                        "id": body.user_id,
                        "name": body.username
                    }
                }
            })
            if(result.modifiedCount == 0){
                return res.status(401).json({
                    success: 1,
                    message: 'Wrong Invitation Pin',
                    data: result,
                })
            }else {
                return res.status(201).json({
                    success: 1,
                    message: 'Join Event Successfully',
                    data: result,
                })
            }
        } catch (error) {
            next(error)
        }        
    },
}