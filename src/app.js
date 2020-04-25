require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { NODE_ENV } = require('./config')
const validateToken = require('./validateToken')
const errorHandler = require('./errorHandler')
const bookmarksRouter = require('./bookmarks/bookmarks-router')

const app = express();

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {skip: () => NODE_ENV === 'test'}))
app.use(helmet());
app.use(cors());
app.use(validateToken)

app.use(bookmarksRouter)

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.get('/fun', (req, res) => {
    res.send(`
    [{
        "id": 3, 
        "title": "MDN", 
        "url": "https://developer.mozilla.org", 
        "description": "The only place blah blah blah...", 
        "rating": 5
    }]`
    );
})

app.use(errorHandler)

module.exports = app