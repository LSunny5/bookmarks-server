const express = require('express')
//const { v4: uuidv4 } = require('uuid')
const xss = require('xss');
const logger = require('../logger')
//const store = require('../store')
const { isWebUri } = require('valid-url')
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    description: xss(bookmark.description),
    rating: Number(bookmark.rating),
})

bookmarksRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next)
        //res.json(store.bookmarks)
    })
    .post(bodyParser, (req, res, next) => {
        for (const field of ['title', 'url', 'rating']) {
            if (!req.body[field]) {
                logger.error(`${field} is required`)
                return res.status(400).send({
                    error: { message: `'${field}' is required` }
                })
            }
        }

        const { title, url, description, rating } = req.body
        const ratingNum = Number(rating);

        if (!Number.isInteger(ratingNum) || ratingNum < 0 || ratingNum > 5) {
            logger.error(`Invalid rating '${rating}' try again`)
            return res.status(400).send({
                error: { message: `'rating' must be a number between 0 and 5` }
            })
        }

        if (!isWebUri(url)) {
            logger.error(`Invalid url '${url}' supplied`)
            return res.status(400).send({
              error: { message: `'url' must be a valid URL` }
            })
          }

        const newBookmark = { title, url, description, rating }

        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
            .then(bookmark => {
                logger.info(`Bookmark with id ${bookmark.id} created.`)
                res
                    .status(201)
                    .location(`/bookmarks/${bookmark.id}`)
                    .json(serializeBookmark(bookmark))
            })
            .catch(next)
    })

//store.bookmarks.push(bookmark)
/* logger.info(`Bookmark with id ${bookmark.id} created`)
res
    .status(201)
    .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
    .json(bookmark) 
})*/

//bookmarks with id
bookmarksRouter
    .route('/bookmarks/:bookmark_id')
    .all((req, res, next) => {
        const { bookmark_id } = req.params
        BookmarksService.getById(req.app.get('db'), bookmark_id)
            .then(bookmark => {
                if (!bookmark) {
                    logger.error(`Bookmark with id ${bookmark_id} not found.`)
                    return res.status(404).json({
                        error: { message: `Bookmark Not Found` }
                    })
                }
                res.bookmark = bookmark
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(serializeBookmark(res.bookmark))
        //removed for post refactor
        /* const knexInstance = req.app.get('db')
        BookmarksService.getById(knexInstance, req.params.bookmark_id)
            .then(bookmark => {
                if (!bookmark) {
                    return res.status(404).json({
                        error: { message: `Bookmark doesn't exist` }
                    })
                }
                res.json(bookmark)
            })
            .catch(next) */

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
    .delete((req, res, next) => {
        const { bookmark_id } = req.params
        //const bookmarkIndex = store.bookmarks.findIndex(b => b.id === bookmark_id)
        /*  if (bookmarkIndex === -1) {
             logger.error(`Bookmark with id ${bookmark_id} was not found.`)
             return res
                 .status(404)
                 .send('Bookmark was not found, try again...')
         }
         store.bookmarks.splice(bookmarkIndex, 1)
         logger.info(`Bookmark with id ${bookmark_id} deleted.`)
         res
             .status(204)
             .end() */
        BookmarksService.deleteBookmark(
            req.app.get('db'),
            bookmark_id
        )
            .then(numRowsAffected => {
                logger.info(`Bookmark with id ${bookmark_id} deleted.`)
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = bookmarksRouter