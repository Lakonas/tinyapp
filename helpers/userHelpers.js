// helpers/userHelpers.js

/**
 * Find user by email address
 * @param {string} email - Email to search for
 * @param {object} users - Users database object
 * @returns {object|undefined} User object if found, undefined otherwise
 */
function getUserByEmail(email, users) {
  if (!email || !users) {
    return undefined;
  }
  
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  
  return undefined;
}

/**
 * Find user by user ID
 * @param {string} userId - User ID to search for
 * @param {object} users - Users database object
 * @returns {object|undefined} User object if found, undefined otherwise
 */
function getUserById(userId, users) {
  return users[userId];
}

module.exports = { 
  getUserByEmail,
  getUserById
};