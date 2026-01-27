const pool = require('../config/database');

class User{
  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  static async findById(id){

    try{
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    }catch (err) {
      console.error('Error finding user by ID:',err);
      throw err;
    }
  } 

  /**
   * find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null} - returns user object or null
   */
  static async findByEmail(email){
    try{
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    }catch (err) {
      console.error('Error finding user by email:', err);
      throw err;
    }
  }

  /**
   * Create new user
   * @param {string} id - User ID
   * @param {string} email - user email
   * @param {string} passwordHash - Hashed password
   * @returns {Promise<object>} Created user object
   */

  static async create(id, email, passwordHash) {

    try{
      const result = await pool.query(
        'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
        [id, email, passwordHash]
      );
      return result.rows[0];

    }catch (err){
      console.error('Error creating user:', err);
      throw err;
    }
  }

  /**
   * Get all users (for debugging/admin)
   * @returns {Promise<array>} Array of user objects
   */
  static async findAll()
   {
    try{
      const result = await pool.query('SELECT * FROM users');
      return result.rows;
    }catch (err){
      console.error('Error finding all users:', err);
      throw err;
    }

  }
  
}
module.exports = User; 

