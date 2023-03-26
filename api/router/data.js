const app = require('express')
const router = app.Router()
const data = require('../controller/data')

router.get('/getOrganization/:admin_id', data.getOrganization);
router.get('/getEventByUserID/:user_id', data.getEventByUserID);
router.get('/getEventByOrganizationID/:organization_id', data.getEventByOrganizationID);
router.get('/getOrganizationByUserID/:user_id', data.getOrganizationByUserID);

router.get('/getEventByManagerID/:manager_id', data.getEventByManagerID);

module.exports = router