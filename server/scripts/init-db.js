
const { sql, poolPromise } = require('../db');

async function initDB() {
  try {
    const pool = await poolPromise;
    console.log('Initializing Virtual Tag Tables (Synapse Compatible - No Default Functions)...');

    // Helper to check existence
    const checkTable = async (name) => {
        const res = await pool.request().query(`SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${name}'`);
        return res.recordset.length > 0;
    };

    // 1. App_VirtualTags
    if (!(await checkTable('App_VirtualTags'))) {
      console.log('Creating App_VirtualTags...');
      await pool.request().query(`
        CREATE TABLE App_VirtualTags (
          id INT IDENTITY(1,1) NOT NULL,
          name NVARCHAR(255) NOT NULL,
          building_code NVARCHAR(50) NOT NULL,
          formula NVARCHAR(4000),
          description NVARCHAR(500),
          created_by NVARCHAR(100),
          created_at DATETIME, -- Function defaults not checking in Synapse
          is_active BIT DEFAULT 1
        )
        WITH (DISTRIBUTION = ROUND_ROBIN, HEAP)
      `);
      console.log('✅ App_VirtualTags created.');
    } else {
      console.log('ℹ️ App_VirtualTags already exists.');
    }

    // 2. App_VirtualTagData
    if (!(await checkTable('App_VirtualTagData'))) {
      console.log('Creating App_VirtualTagData...');
      await pool.request().query(`
        CREATE TABLE App_VirtualTagData (
          id BIGINT IDENTITY(1,1) NOT NULL,
          tag_id INT NOT NULL, 
          timestamp DATETIME NOT NULL,
          value FLOAT,
          created_at DATETIME
        )
        WITH (DISTRIBUTION = ROUND_ROBIN, CLUSTERED COLUMNSTORE INDEX)
      `);
      console.log('✅ App_VirtualTagData created.');
    } else {
        console.log('ℹ️ App_VirtualTagData already exists.');
    }

  } catch (err) {
    console.error('❌ Error initializing database:', err);
    console.error('Details:', err.originalError?.info?.message || err.message);
  } finally {
    setTimeout(() => process.exit(0), 1000);
  }
}

initDB();
