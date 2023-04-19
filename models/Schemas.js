const db = require('../db-config')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const organizationsSchema = new Schema({
    name: {
        type: String, require: true
    },
    description: {
        type: String, require: true
    },
    admin: [
        {
            id: {type: Schema.Types.ObjectId, ref: 'Users', require: true},
            joinedDate: {type: Date, default: Date.now}
        }
    ],
    managers: [
        {
            id: {type: Schema.Types.ObjectId, ref: 'Users', require: true},
            name: {type: String, require: true},
            createdDate: {type: Date, default: Date.now}
        }
    ],
})

const eventsSchema = new Schema({
    name: {
        type: String, require: true
    },
    description: {
        type: String, require: true
    },
    status: {
        type: Boolean, default: false
    },
    face: {
        type: Boolean, default: false
    },
    managers: [
        {
            id: {type: Schema.Types.ObjectId, ref: 'Users', require: true},
            name: {type: String, require: true}, 
            createdDate: {type: Date, default: Date.now},
            creator: {type: Schema.Types.ObjectId, ref: 'Users', require: true}
        }
    ],
    participants: [
        {
            id: {type: Schema.Types.ObjectId, ref: 'Users', require: true},
            name: {type: String, require: true}, 
            joinedDate: {type: Date, default: Date.now},
            status: {type: String, default: "Absent"},
            location: {
                type: [Number], default: [null, null] 
            },
            IPAddress: {type: String, default: '0.0.0.0'}
        }
    ],
    invitationPin: {
        type: String, require: true
    },
    organization: {
        id: {type: Schema.Types.ObjectId, ref: 'Organizations', require: true},
        name: {type: String, require: true}
    },
    location: {
        type: [Number], default: [null, null] 
    },
    ipaddress: {
        type: String, default: '0.0.0.0'
    },
})

const usersSchema = new Schema({
    username: {
        type: String, require: true
    },
    email: {
        type: String, require: true
    },
    password: {
        type: String, require: true
    },
    faceModel: {
        type: Buffer, default: undefined
    },
    type: {
        type: String, require: true
    }
})

const Users = mongoose.model('Users', usersSchema)
const Organizations = mongoose.model('Organizations', organizationsSchema)
const Events = mongoose.model('Events', eventsSchema)
const schema = {'Users': Users, 'Organizations': Organizations, 'Events': Events}

module.exports = schema