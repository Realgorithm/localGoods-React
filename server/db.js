import { createPool } from 'mysql2/promise';

// A map to cache connection pools for different shops
const shopPools = new Map();

// New pool to connect to MySQL server without a specific DB.
// This is for admin tasks like creating new databases.
const masterPool = createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Your MySQL root password
  waitForConnections: true,
  connectionLimit: 5, // Lower limit for admin tasks
  queueLimit: 0
});

// This function mimics the behavior of your shopConn() function in PHP.
// It creates a dedicated connection pool for a specific shop's database.
const getShopConnection = async (dbName) => {
  if (!dbName) {
    throw new Error("Database name for the shop is not provided.");
  }

  // If a pool for this database already exists, return it.
  if (shopPools.has(dbName)) {
    return shopPools.get(dbName);
  }

  // Otherwise, create a new pool, cache it, and return it.
  const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Your MySQL root password
    database: dbName,
    waitForConnections: true,
    connectionLimit: 15, // A reasonable default connection limit for a single shop's pool
    queueLimit: 0
  });

  shopPools.set(dbName, pool);
  return pool;
};

export { getShopConnection, masterPool };