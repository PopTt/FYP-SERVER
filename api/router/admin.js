const app = require('express')
const router = app.Router()
const admin = require('../controller/admin')

router.post('/createOrganization', admin.createOrganization);
router.post('/createManager', admin.createManager);
router.post('/createEvent', admin.createEvent);
router.post('/assignManager', admin.assignManager);

module.exports = router
