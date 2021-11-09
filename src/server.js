'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const notFoundHandler = require('./error-handlers/404.js');
const errorHandler = require('./error-handlers/500.js');
const logger = require('./middleware/logger.js');
const authRouter = require('./routes/auth');


const v1Routes = require('./routes/v1');
const v2Routes = require('./routes/v2');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
// App Level MW
app.use(cors());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  try {
    res.status(200).send(' !!! working Fine');
  } catch (e) {
    console.error;
  }
});

app.use(authRouter);
app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

app.use('*', notFoundHandler);
app.use(errorHandler);


module.exports = {
  server: app,
  start: port => {
    if (!port) { throw new Error('Missing Port'); }
    app.listen(port, () => console.log(`Listening on ${port}`));
  },
};
