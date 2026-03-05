const sql = require('mssql');

const config = {
    user: 'readonlyappuser',
    password: 'sqHbKRVQmk7TYDyEXtfWG6',
    server: 'dev-saw-tcld-01.sql.azuresynapse.net',
    database: 'tcld_syn_db_dev',
    options: {
        encrypt: true,
        trustServerCertificate: false,
        connectTimeout: 30000 
    }
};

async function testConnection() {
    try {
        console.log('Attempting to connect to Azure Synapse...');
        console.log(`Server: ${config.server}`);
        console.log(`Database: ${config.database}`);
        console.log(`User: ${config.user}`);
        
        await sql.connect(config);
        
        console.log('✅ Connection Sucessful!');
        
        const result = await sql.query`SELECT @@VERSION as version`;
        console.log('📊 Database Version:', result.recordset[0].version);
        
        // Try to list tables to prove read access
        const tables = await sql.query`
            SELECT TOP 5 TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
        `;
        
        console.log('📑 First 5 Tables:');
        tables.recordset.forEach(row => console.log(` - ${row.TABLE_NAME}`));

        await sql.close();
    } catch (err) {
        console.error('❌ Connection Failed:', err);
        process.exit(1);
    }
}

testConnection();