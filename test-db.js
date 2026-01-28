const pool = require('./config/database');

async function testConnection(){
  try{
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful!');
    console.log('Current time from database:', result.rows[0].now);
    process.exit(0);
  }catch (err) {
    console.error('Database connection failed', err);
    process.exit(1);
  }
}

testConnection();

