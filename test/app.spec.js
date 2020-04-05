const app = require('../src/app')
const store = require('../src/store')

describe('Bookmark endpoints', () => {
  //create a copy of bookmarks array for testing
  let testBookmarks
  beforeEach('copy array to use for tests', () => {
    testBookmarks = store.bookmarks.slice()
  })
  //return bookmarks array to original
  afterEach('return the bookmarks array to normal', () => {
    store.bookmarks = testBookmarks
  })

  //unauthorized request or no api key for each endpoint
  describe(`Unauthorized requests`, () => {
    //homepage
    it(`responds with 401 Unauthorized for GET /bookmarks`, () => {
      return supertest(app)
        .get('/bookmarks')
        .expect(401, { error: 'Unauthorized request' })
    })
    //cannot find the bookmark
    it(`responds with 401 Unauthorized for GET /bookmarks/:id`, () => {
      const anotherBookmark = store.bookmarks[1]
      return supertest(app)
        .get(`/bookmarks/${anotherBookmark.id}`)
        .expect(401, { error: 'Unauthorized request' })
    })
    //cannot find the bookmark to delete
    it(`responds with 401 Unauthorized for DELETE /bookmarks/:id`, () => {
      const bookmarkDelete = store.bookmarks[1]
      return supertest(app)
        .delete(`/bookmarks/${bookmarkDelete.id}`)
        .expect(401, { error: 'Unauthorized request' })
    })
    //cannot add bookmark
    it(`responds with 401 Unauthorized for POST /bookmarks`, () => {
      return supertest(app)
        .post('/bookmarks')
        .send({ title: 'test-title', url: 'http://some.thing.com', rating: 1 })
        .expect(401, { error: 'Unauthorized request' })
    })
  })

  //load bookmarks from array store
  describe('GET /bookmarks', () => {
    it('gets bookmarks from store', () => {
      return supertest(app)
        .get('/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, store.bookmarks)
    })
  })

  //test for when bookmark is not there
  describe('GET /bookmarks/:id', () => {
    it('from store.js find the bookmarks', () => {
      const findBookmark = store.bookmarks[1]
      return supertest(app)
        .get(`/bookmarks/${findBookmark.id}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, findBookmark)
    })
    //bookmark was not found
    it(`returns 404 whe bookmark doesn't exist`, () => {
      return supertest(app)
        .get(`/bookmarks/doesnt-exist`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(404, 'Bookmark Not Found')
    })

    //check for deleting bookmark, find bookmark
    describe('DELETE /bookmarks/:id', () => {
      it('removes the bookmark by ID from the store', () => {
        const bookmark = store.bookmarks[1]
        const expectedBookmarks = store.bookmarks.filter(s => s.id !== bookmark.id)
        return supertest(app)
          .delete(`/bookmarks/${bookmark.id}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then(() => {
            expect(store.bookmarks).to.eql(expectedBookmarks)
          })
      })
      //check for error when bookmark doesn't exist
      it(`returns 404 whe bookmark doesn't exist`, () => {
        return supertest(app)
          .delete(`/bookmarks/doesnt-exist`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, 'Bookmark Not Found')
      })
    })

    //check for adding bookmarks
    describe('POST /bookmarks', () => {
      //check if title was given by client
      it(`returns with 400 if 'title' is missing`, () => {
        const bookmarkNoTitle = {
          url: 'https://extra.com',
          rating: 1,
        }
        return supertest(app)
          .post(`/bookmarks`)
          .send(bookmarkNoTitle)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(400, `'title' is missing`)
      })
      //check for missing url
      it(`returns with 400 if url is missing`, () => {
        const bookmarkNoURL = {
          title: 'testTitle',
          rating: 2,
        }
        return supertest(app)
          .post(`/bookmarks`)
          .send(bookmarkNoURL)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(400, `'url' is missing`)
      })
      //check to see if URL is valid
      it(`returns 400 if URL given is not a valid URL`, () => {
        const wrongURL = {
          title: 'URL check',
          url: 'htp://doesnotwork',
          rating: 1,
        }
        return supertest(app)
          .post(`/bookmarks`)
          .send(wrongURL)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(400, `'url' must be a valid URL`)
      })
      //check if rating is missing
      it(`returns with 400 if rating is missing`, () => {
        const bookmarkNoRating = {
          title: 'example1',
          url: 'https://visitation.com',
        }
        return supertest(app)
          .post(`/bookmarks`)
          .send(bookmarkNoRating)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(400, `'rating' is required`)
      })
      //check to see if rating is a number between 0 and 5
      it(`returns 400 if rating is not between 0 and 5`, () => {
        const incorrectRating = {
          title: 'testRating',
          url: 'https://rating.com',
          rating: 'abc',
        }
        return supertest(app)
          .post(`/bookmarks`)
          .send(incorrectRating)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(400, `'rating' must be a number between 0 and 5`)
      })
      //check that new bookmark is added
      it('new bookmark was addded', () => {
        const newBookmark = {
          title: 'New Bookmark',
          url: 'https://newbookmark.com',
          description: 'this is a new bookmark that was added',
          rating: 3,
        }
        return supertest(app)
          .post(`/bookmarks`)
          .send(newBookmark)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(201)
          .expect(res => {
            expect(res.body.title).to.eql(newBookmark.title)
            expect(res.body.url).to.eql(newBookmark.url)
            expect(res.body.description).to.eql(newBookmark.description)
            expect(res.body.rating).to.eql(newBookmark.rating)
            expect(res.body.id).to.be.a('string')
          })
          .then(res => {
            expect(store.bookmarks[store.bookmarks.length - 1]).to.eql(res.body)
          })
      })
    })
  })
})