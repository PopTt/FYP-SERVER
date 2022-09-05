const app = require('express')
const router = app.Router()
const participant = require('../controller/participant')

router.post('/sign/', participant.signAttendance);
router.post('/join/', participant.joinEvent);

module.exports = router