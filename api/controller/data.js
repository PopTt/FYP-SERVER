const schema = require('../../models/Schemas')

module.exports = {
    getOrganization: async (req, res, next) => {
        const admin_id = req.params.admin_id.toString()
        try {
            const organizations = await schema.Organizations.find({
                'admin.id': {
                    $all: admin_id
                }
            }).sort({updateAt: 1})

            return res.status(201).json({
                success: 1,
                message: 'Get Organization Successfully',
                data: organizations,
            })
        } catch (error) {
            next(error)
        }                
    },

    getOrganizationByUserID: async (req, res, next) => {
        const user_id = req.params.user_id.toString()
        try {
            const events = await schema.Events.find({
                'participants.id': {
                    $all: user_id
                }
            }).sort({updateAt: 1})

            
            return res.status(201).json({
                success: 1,
                message: 'Get Organization Successfully',
                data: events,
            })
        } catch (error) {
            next(error)
        }                
    },

    getEventByUserID: async (req, res, next) => {
        const user_id = req.params.user_id.toString()
        try {
            const events = await schema.Events.find({
                'participants.id': {
                    $all: user_id
                }
            }).sort({updateAt: 1})

            return res.status(201).json({
                success: 1,
                message: 'Get Event Successfully',
                data: events,
            })
        } catch (error) {
            next(error)
        }                
    },

    getEventByOrganizationID: async (req, res, next) => {
        const organization_id = req.params.organization_id.toString()
        try {
            const events = await schema.Events.find({
                'organization.id': {
                    $all: organization_id
                }
            }).sort({updateAt: 1})

            return res.status(201).json({
                success: 1,
                message: 'Get Event Successfully',
                data: events,
            })
        } catch (error) {
            next(error)
        }                
    },

    getEventByManagerID: async (req, res, next) => {
        const manager_id = req.params.manager_id.toString()
        try {
            const events = await schema.Events.find({
                'managers.id': {
                    $all: manager_id
                }
            }).sort({updateAt: 1})

            return res.status(201).json({
                success: 1,
                message: 'Get Event Successfully',
                data: events,
            })
        } catch (error) {
            next(error)
        }                
    },
}