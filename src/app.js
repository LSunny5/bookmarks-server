require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { NODE_ENV } = require('./config')
const validateToken = require('./validateToken')
const errorHandler = require('./error-handler')



const app = express();

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(validateToken)





app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(errorHandler)

module.exports = app