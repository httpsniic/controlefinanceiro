const bcrypt = require('bcrypt');

const senha = '020206';

bcrypt.hash(senha, 10).then(hash => {
  console.log(hash);
  process.exit(0);
});
