const pool = require('../config/database');

class Url {
  /**
   * Find URL by short code
   * @param {string} shortCode - Short URL code
   * @returns {Promise<Object|null>} URL object or null
   */
  static async findByShortCode(shortCode) {
    try {
      const result = await pool.query(
        'SELECT * FROM urls WHERE short_code = $1',
        [shortCode]
      );
      return result.rows[0] || null;
    } catch (err) {
      console.error('Error finding URL by short code:', err);
      throw err;
    }
  }

  /**
   * Find all URLs belonging to a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of URL objects
   */
  static async findByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM urls WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows;
    } catch (err) {
      console.error('Error finding URLs by user ID:', err);
      throw err;
    }
  }

  /**
   * Create new URL
   * @param {string} shortCode - Short URL code
   * @param {string} longUrl - Long URL
   * @param {string} userId - User ID who owns this URL
   * @returns {Promise<Object>} Created URL object
   */
  static async create(shortCode, longUrl, userId) {
    try {
      const result = await pool.query(
        'INSERT INTO urls (short_code, long_url, user_id) VALUES ($1, $2, $3) RETURNING *',
        [shortCode, longUrl, userId]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error creating URL:', err);
      throw err;
    }
  }

  /**
   * Update URL's long_url
   * @param {string} shortCode - Short URL code
   * @param {string} newLongUrl - New long URL
   * @returns {Promise<Object>} Updated URL object
   */
  static async update(shortCode, newLongUrl) {
    try {
      const result = await pool.query(
        'UPDATE urls SET long_url = $1 WHERE short_code = $2 RETURNING *',
        [newLongUrl, shortCode]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error updating URL:', err);
      throw err;
    }
  }

  /**
   * Delete URL by short code
   * @param {string} shortCode - Short URL code
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async deleteByShortCode(shortCode) {
    try {
      const result = await pool.query(
        'DELETE FROM urls WHERE short_code = $1 RETURNING *',
        [shortCode]
      );
      return result.rowCount > 0;
    } catch (err) {
      console.error('Error deleting URL:', err);
      throw err;
    }
  }

}

module.exports = Url;