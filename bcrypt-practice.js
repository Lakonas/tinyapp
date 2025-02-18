const bcrypt = require('bcryptjs');

bcrypt.genSalt(10, (err, salt) => {
  console.log('salt', salt);
  bcrypt.hash('hello', salt, (err, hash) => {
    console.log('hash', hash);
  });
})

console.log('below the salt call');