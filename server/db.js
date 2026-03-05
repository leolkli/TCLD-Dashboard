const sql = require('mssql');
const config = require('./config/db');

// Create a connection pool singleton
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Connected to Azure Synapse');
    return pool;
  })
  .catch(err => {
    console.error('❌ Database Connection Failed! Bad Config: ', err);
    process.exit(1);
  });

module.exports = {
  sql,
  poolPromise
};