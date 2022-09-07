const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const auth_router = require('./api/router/auth')
const admin_router = require('./api/router/admin')
const data_router = require('./api/router/data')
const manager_router = require('./api/router/manager')
const participant_router = require('./api/router/participant')

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 5000;

//CORS Settings
const corsOption = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};
app.use(cors(corsOption));

//Incoming Request Settings
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization,  X-PINGOTHER'
  );
  res.header('Access-Control-Allow-Credentials', true);
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS'
  );
  next();
});

app.use('/auth', auth_router);
app.use('/admin', admin_router);
app.use('/data', data_router);
app.use('/manager', manager_router);
app.use('/participant', participant_router);

app.listen(PORT, () => {
  console.log('Server started on Port ' + PORT);
});