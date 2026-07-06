import { createPool } from 'mysql2/promise';

const connectionConfig = process.env.DATABASE_URL
  ? {
    // Production config (from DATABASE_URL)
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
  }
  : {
    // Local development config
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
  };
  // : {
  //   // Local development config
  //   host: process.env.DB_HOST || 'localhost',
  //   user: process.env.DB_USER || 'root',
  //   password: process.env.DB_PASSWORD || '',
  //   database: process.env.DB_DATABASE || 'shop_management',
  //   waitForConnections: true,
  //   connectionLimit: 15,
  //   queueLimit: 0,
  // };

const pool = createPool(connectionConfig);

// Optional: Test the connection on startup
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to the database!');
    connection.release();
  })
  .catch(error => {
    console.error('Error connecting to the database:', error);
  });
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("DB_USER:", process.env.DB_USER);
export { pool };