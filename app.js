const express = require('express');
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
const helmet = require('helmet');

const { errors } = require('celebrate');

const router = require('./routes');

const errorHandler = require('./middlewares/error');

const { requestLogger, errorLogger } = require('./middlewares/logger');

const limiter = require('./middlewares/limiter');
const { DEV_DB_URL } = require('./utils/constrains');

const { PORT = 3000 } = process.env;
const DBUrl = process.env.NODE_ENV !== 'dev' ? DEV_DB_URL : process.env.DB_CONN;

const app = express();

app.use(cors({
  origin:
    [
      'http://localhost:3001',
      'http://seiko.anna.nomoredomains.xyz',
      'https://seiko.anna.nomoredomains.xyz',
    ],
  credentials: true,
}));

mongoose.connect(DBUrl);

app.use(express.json());


app.use(cookieParser());

app.use(helmet());

app.use(requestLogger);

app.use(router);

app.use(errorLogger);

app.use(limiter);

app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
