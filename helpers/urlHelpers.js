// helpers/urlHelpers.js

/**
 * Get all URLs belonging to a specific user
 * @param {string} userId - User ID to filter by
 * @param {object} urlDatabase - URL database object
 * @returns {object} Object containing only the user's URLs
 */
function urlsForUser(userId, urlDatabase) {
  const userUrls = {};
  
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userId) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  
  return userUrls;
}

/**
 * Check if a URL exists in the database
 * @param {string} shortURL - Short URL code to check
 * @param {object} urlDatabase - URL database object
 * @returns {boolean} True if URL exists, false otherwise
 */
function urlExists(shortURL, urlDatabase) {
  return urlDatabase.hasOwnProperty(shortURL);
}

/**
 * Check if a user owns a specific URL
 * @param {string} shortURL - Short URL code
 * @param {string} userId - User ID to check
 * @param {object} urlDatabase - URL database object
 * @returns {boolean} True if user owns URL, false otherwise
 */
function userOwnsUrl(shortURL, userId, urlDatabase) {
  const url = urlDatabase[shortURL];
  return url && url.userID === userId;
}

module.exports = {
  urlsForUser,
  urlExists,
  userOwnsUrl
};
