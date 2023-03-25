const app = require('express')
const router = app.Router()
const user = require('../controller/auth')

router.post('/register', user.register);

router.post('/login', user.login);

router.post('/registerFace', user.registerFace);

module.exports = router