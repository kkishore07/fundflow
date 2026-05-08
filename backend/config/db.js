const { pool, initializeSchema } = require('../src/models/sqlStore');

const connectDB = async () => {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('PostgreSQL connected successfully');
    
    // Initialize schema
    await initializeSchema();
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;