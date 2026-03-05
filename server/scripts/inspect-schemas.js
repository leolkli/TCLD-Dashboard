
const { sql, poolPromise } = require('../db');

async function inspectSchemas() {
  try {
    const pool = await poolPromise;
    
    console.log('\n--- Inspecting DW_F_EAPtag (Fact Table) ---');
    // Get columns
    const factCols = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'DW_F_EAPtag'
    `);
    console.log('Columns:', factCols.recordset.map(c => c.COLUMN_NAME).join(', '));

    console.log('\n--- Sample Data from DW_F_EAPtag ---');
    try {
        const factSample = await pool.request().query(`SELECT TOP 1 * FROM dbo.DW_F_EAPtag`);
        console.log(factSample.recordset[0]);
    } catch (e) { console.log('Could not fetch sample from DW_F_EAPtag:', e.message); }

    console.log('\n--- Sample Data from DW_D_EAPtag (Dimension) ---');
    try {
        const dimSample = await pool.request().query(`SELECT TOP 1 Name, Code, F_tablename FROM dbo.DW_D_EAPtag WHERE F_tablename IS NOT NULL`);
        console.log(dimSample.recordset[0]);
    } catch (e) { console.log('Could not fetch sample from DW_D_EAPtag:', e.message); }

  } catch (err) {
    console.error('Database error:', err);
  } finally {
    setTimeout(() => process.exit(0), 1000);
  }
}

inspectSchemas();
