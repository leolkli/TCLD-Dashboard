
const { sql, poolPromise } = require('../db');

async function inspect() {
    try {
        const pool = await poolPromise;
        const res = await pool.request().query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'DW_D_EAPtag'
        `);
        console.log('DW_D_EAPtag COLUMNS:', res.recordset.map(c => c.COLUMN_NAME));
    } catch(e) {
        console.error(e);
    } finally {
        setTimeout(() => process.exit(0), 1000);
    }
}
inspect();
