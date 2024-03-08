/** Database setup for BizTime. */


const { Client } = require('pg');

// I have to use this to get to the db locally...
const connectionString = 'postgresql://postgres:postgres@localhost/biztime';


const client = new Client({
  connectionString: connectionString,
});


client.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Error connecting to database', err.stack));

module.exports = client;

