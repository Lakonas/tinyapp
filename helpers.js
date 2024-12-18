function getUserByEmail(email,users) {
  if (!email || !users) {
    return undefined; // Return undefined if email or users is not provided
  }
  
  
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  
}

module.exports = { getUserByEmail };