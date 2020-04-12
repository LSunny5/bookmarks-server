const express = require('express')
const { v4: uuidv4 } = require('uuid')
const logger = require('../logger')
const store = require('../store')
const { isWebUri } = require('valid-url')

const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks)
            })
            .catch(next)
        //res.json(store.bookmarks)
    })
    .post(bodyParser, (req, res) => {
        for (const field of ['url', 'title', 'rating']) {
            if (!req.body[field]) {
                logger.error(`${field} is required`)
                return res.status(400).send(`'${field}' is required`)
            }
        }

        const { title, url, description, rating } = req.body

        if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
            logger.error(`Invalid rating '${rating}' try again`)
            return res.status(400).send(`rating must be between 0 and 5`)
        }

        //pulled from solution, check if web is a valid URL
        if (!isWebUri(url)) {
            logger.error(`Invalid url '${url}' supplied`)
            return res.status(400).send(`'url' must be a valid URL`)
        }

        const bookmark = { id: uuidv4(), title, url, description, rating }

        store.bookmarks.push(bookmark)

        logger.info(`Bookmark with id ${bookmark.id} created`)
        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
            .json(bookmark)
    })

//bookmarks with id
bookmarksRouter
    .route('/bookmarks/:bookmark_id')
    .get((req, res) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getById(knexInstance, req.params.bookmark_id)
            .then(bookmark => {
                if (!bookmark) {
                    return res.status(404).json({
                        error: { message: `Bookmark doesn't exist` }
                    })
                }
                res.json(bookmark)
            })
            .catch(next)

        /* removed after database express refactor
        const bookmark = store.bookmarks.find(c => c.id == bookmark_id)

        if (!bookmark) {
            logger.error(`Bookmark with id ${bookmark_id} not found.`)
            return res
                .status(404)
                .send('Bookmark Not Found')
        }
        res.json(bookmark) */
    })
    .delete((req, res) => {
        const { bookmark_id } = req.params
        const bookmarkIndex = store.bookmarks.findIndex(b => b.id === bookmark_id)

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${bookmark_id} was not found.`)
            return res
                .status(404)
                .send('Bookmark was not found, try again...')
        }
        store.bookmarks.splice(bookmarkIndex, 1)
        logger.info(`Bookmark with id ${bookmark_id} deleted.`)
        res
            .status(204)
            .end()
    })

module.exports = bookmarksRouter