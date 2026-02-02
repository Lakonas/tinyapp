// models/Click.js
const pool = require('../config/database');

class Click {
  // Create a new click record
  static async create(shortCode, ipAddress = null, userAgent = null) {
    const query = `
      INSERT INTO clicks (short_code, clicked_at, ip_address, user_agent)
      VALUES ($1, NOW(), $2, $3)
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [shortCode, ipAddress, userAgent]);
      return result.rows[0];
    } catch (err) {
      console.error('Error creating click:', err);
      throw err;
    }
  }

  // Get all clicks for a specific URL
  static async findByShortCode(shortCode) {
    const query = `
      SELECT * FROM clicks
      WHERE short_code = $1
      ORDER BY clicked_at DESC
    `;
    
    try {
      const result = await pool.query(query, [shortCode]);
      return result.rows;
    } catch (err) {
      console.error('Error finding clicks:', err);
      throw err;
    }
  }

  // Count total clicks for a URL
  static async countByShortCode(shortCode) {
    const query = `
      SELECT COUNT(*) as count
      FROM clicks
      WHERE short_code = $1
    `;
    
    try {
      const result = await pool.query(query, [shortCode]);
      return parseInt(result.rows[0].count);
    } catch (err) {
      console.error('Error counting clicks:', err);
      throw err;
    }
  }

  // Get clicks grouped by date (for charts)
  static async getClicksByDate(shortCode, days = 7) {
    const query = `
      SELECT 
        DATE(clicked_at) as date,
        COUNT(*) as count
      FROM clicks
      WHERE short_code = $1
        AND clicked_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(clicked_at)
      ORDER BY date
    `;
    
    try {
      const result = await pool.query(query, [shortCode]);
      return result.rows;
    } catch (err) {
      console.error('Error getting clicks by date:', err);
      throw err;
    }
  }
  // Count unique visitors (returns 0 if IP tracking disabled)
  static async countUniqueVisitors(shortCode) {
    const query = `
      SELECT COUNT(DISTINCT ip_address) as unique_visitors
      FROM clicks
      WHERE short_code = $1 AND ip_address IS NOT NULL
    `;
    
    try {
      const result = await pool.query(query, [shortCode]);
      return parseInt(result.rows[0].unique_visitors);
    } catch (err) {
      console.error('Error counting unique visitors:', err);
      throw err;
    }
  }
  // Get recent clicks (last N clicks)
  static async getRecentClicks(shortCode, limit = 10) {
    const query = `
      SELECT * FROM clicks
      WHERE short_code = $1
      ORDER BY clicked_at DESC
      LIMIT $2
    `;
    
    try {
      const result = await pool.query(query, [shortCode, limit]);
      return result.rows;
    } catch (err) {
      console.error('Error getting recent clicks:', err);
      throw err;
    }
  }}
  

module.exports = Click;