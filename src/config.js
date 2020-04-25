module.exports = {
    PORT: process.env.PORT || 8000,
    API_TOKEN: process.env.API_TOKEN || 'dummy-api-token',
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL,
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
  }