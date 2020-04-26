require('dotenv').config();

//console.log('node environment: ' + process.env.NODE_ENV);
//console.log('The database url is: ' + process.env.DATABASE_URL);

module.exports = {
    "migrationDirectory": "migrations",
    "driver": "pg",
    "connectionString": (process.env.NODE_ENV === 'test')
      ? process.env.TEST_DATABASE_URL
      : process.env.DATABASE_URL,
      "ssl": !!process.env.SSL,
  }