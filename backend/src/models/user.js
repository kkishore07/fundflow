const db = require('./index');

// User model wrapper for PostgreSQL
const User = {
  create: (email, name, password, role = 'user') => 
    db.createUser(email, name, password, role),
  
  findById: (id) => 
    db.getUserById(id),
  
  findByEmail: (email) => 
    db.getUserByEmail(email),
  
  findByIdAndUpdate: (id, data) => 
    db.updateUser(id, data),
};

module.exports = User;
