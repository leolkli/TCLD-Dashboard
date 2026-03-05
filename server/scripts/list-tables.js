const { sql, poolPromise } = require('../db');

async function listTables() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT s.name as SchemaName, t.name as TableName 
            FROM sys.tables t 
            JOIN sys.schemas s ON t.schema_id = s.schema_id 
            ORDER BY s.name, t.name
        `);
        console.table(result.recordset);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

listTables();