const {Pool} = require ('pg');

const pool = new Pool({
  user:'labber',
  host:'localhost',
  database: 'tinyapp',
  password: 'labber',
  port:5432,
});

pool.on('connect' , () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle content', err);
  process.exit(-1);
});

module.exports = pool;

