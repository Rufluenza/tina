const mysql = require('mysql2/promise');

export const db = await mysql.createPool({
  host: 'raspberrypi',
  user: 'ruben',
  password: 'M!ndbK0d3',
  database: 'smsd',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
