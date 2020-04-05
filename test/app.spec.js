const app = require('../src/app')
const store = require('../src/store')

describe('Bookmark endpoints', () => {

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








  
})
















})