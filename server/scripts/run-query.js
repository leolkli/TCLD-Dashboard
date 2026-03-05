const { sql, poolPromise } = require('../db');

const query = process.argv[2] || "SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";

async function runQuery() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(query);
        
        console.table(result.recordset);
        
        await pool.close(); 
        // Note: pool.close() might not be exposed directly if db.js doesn't export the pool itself but the promise. 
        // But mssql pool usually handles this or process.exit() is fine for a script.
        process.exit(0);
    } catch (err) {
        console.error('SQL Error:', err);
        process.exit(1);
    }
}

runQuery();