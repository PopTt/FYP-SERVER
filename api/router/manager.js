const app = require('express')
const router = app.Router()
const manager = require('../controller/manager')

router.post('/assign/', manager.assignUser);


module.exports = router