// helpers/utils.js

/**
 * Generates a random alphanumeric string
 * @param {number} length - Length of string to generate (default 6)
 * @returns {string} Random string
 */
function generateRandomString(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = { generateRandomString };

