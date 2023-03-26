const app = require('express')
const router = app.Router()
const manager = require('../controller/manager')

router.post('/assign/', manager.assignUser);
router.post('/updateAttendance/', manager.updateAttendance);

module.exports = router