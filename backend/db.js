import { createPool } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let connectionConfig;

if (process.env.DATABASE_URL) {
  // Parse the connection string ourselves instead of passing it straight
  // through as `uri`, so we can reliably attach the SSL/CA cert Aiven
  // requires alongside the connection details.
  const dbUrl = new URL(process.env.DATABASE_URL);
  connectionConfig = {
    host: dbUrl.hostname,
    port: Number(dbUrl.port) || 3306,
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace(/^\//, ''),
    ssl: {
      ca: fs.readFileSync(path.join(__dirname, 'certs', 'aiven-ca.pem')),
    },
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
  };
} else {
  // Local development config
  connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'shop_management',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
  };
}

const pool = createPool(connectionConfig);

// Test the connection on startup
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to the database!');
    connection.release();
  })
  .catch(error => {
    console.error('Error connecting to the database:', error.message);
  });

export { pool };