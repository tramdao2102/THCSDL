const { Pool } = require('pg');
require('dotenv').config();

console.log('🔧 Database Configuration:');
console.log('Host:', process.env.DB_HOST || 'localhost');
console.log('Port:', process.env.DB_PORT || 5432);
console.log('Database:', process.env.DB_NAME || 'english_center');
console.log('User:', process.env.DB_USER || 'postgres');
console.log('Password:', process.env.DB_PASSWORD ? '***' : 'Not set');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'english_center',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '160421',
  max: process.env.DB_MAX_CONNECTIONS || 20,
  idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT || 30000,
  connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT || 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  // Không exit process ngay lập tức để debug
  console.error('Error details:', {
    code: err.code,
    message: err.message,
    detail: err.detail
  });
});

// Enhanced test connection function
const testConnection = async () => {
  console.log('🔄 Testing database connection...');
  
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to database');
    
    // Test basic query
    const result = await client.query('SELECT NOW(), version()');
    console.log('📅 Database connection test successful:', result.rows[0].now);
    console.log('🗄️ PostgreSQL version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    
    // Test if database exists and accessible
    const dbTest = await client.query('SELECT current_database()');
    console.log('📁 Current database:', dbTest.rows[0].current_database);
    
    client.release();
    console.log('✅ Database connection test completed successfully');
    
  } catch (err) {
    console.error('❌ Database connection test failed:');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    
    // Specific error handling
    switch (err.code) {
      case 'ECONNREFUSED':
        console.error('🔌 Connection refused - PostgreSQL server might not be running');
        console.error('💡 Try: brew services start postgresql (macOS) or sudo systemctl start postgresql (Linux)');
        break;
      case 'ENOTFOUND':
        console.error('🌐 Host not found - check DB_HOST in .env file');
        break;
      case '28P01':
        console.error('🔐 Authentication failed - check username/password');
        break;
      case '3D000':
        console.error('🗃️ Database does not exist - create database first');
        console.error('💡 Run: CREATE DATABASE english_center;');
        break;
      default:
        console.error('❓ Unknown error:', err);
    }
  }
};

// Call test connection with delay to ensure proper initialization
setTimeout(testConnection, 1000);

module.exports = pool;