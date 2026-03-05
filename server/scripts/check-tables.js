const { poolPromise } = require('../db');

async function checkTables() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT DISTINCT F_tablename FROM dbo.DW_D_EAPtag WHERE F_tablename IS NOT NULL");
        console.log('Fact Tables:', result.recordset);
        process.exit();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkTables();
