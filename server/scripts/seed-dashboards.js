
const { poolPromise } = require('../db');

/**
 * Inserts mock data for dashboard folders and dashboards
 */
async function seedDashboards() {
    try {
        const pool = await poolPromise;
        
        console.log('Seeding Dashboard Folders...');
        
        // 1. App_DashboardFolders
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'App_DashboardFolders')
            BEGIN
                CREATE TABLE App_DashboardFolders (
                    id INT IDENTITY(1,1) NOT NULL,
                    Name NVARCHAR(255) NOT NULL,
                    Description NVARCHAR(500),
                    BuildingCode NVARCHAR(50), 
                    ParentId INT, 
                    SortOrder INT DEFAULT 0
                )
                WITH (DISTRIBUTION = ROUND_ROBIN, HEAP)
            END
        `);

        // Check relevant folders
        const folders = [
            { name: 'HVAC', desc: 'Heating, Ventilation, and Air Conditioning', order: 1 },
            { name: 'Chiller Plant', desc: 'Chiller performance monitoring', order: 2 },
            { name: 'Airside Performance', desc: 'AHU and fan coil unit performance', order: 3 },
            { name: 'Energy Summary', desc: 'Overall energy consumption', order: 0 }
        ];

        for (const folder of folders) {
            const check = await pool.request()
                .input('name', folder.name)
                .query("SELECT COUNT(*) as count FROM App_DashboardFolders WHERE Name = @name");
            
            if (check.recordset[0].count === 0) {
                console.log(`Inserting folder: ${folder.name}`);
                await pool.request()
                    .input('name', folder.name)
                    .input('desc', folder.desc)
                    .input('order', folder.order)
                    .query(`
                        INSERT INTO App_DashboardFolders (Name, Description, SortOrder)
                        VALUES (@name, @desc, @order)
                    `);
            }
        }

        // 2. App_Dashboards
        await pool.request().query(`
             IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'App_Dashboards')
            BEGIN
                CREATE TABLE App_Dashboards (
                    id INT IDENTITY(1,1) NOT NULL,
                    Name NVARCHAR(255) NOT NULL,
                    Description NVARCHAR(500),
                    FolderId INT, -- FK to App_DashboardFolders
                    Config JSON, -- Store layout/widget config
                    IsActive BIT DEFAULT 1,
                    CreatedBy NVARCHAR(100),
                    CreatedAt DATETIME
                )
                WITH (DISTRIBUTION = ROUND_ROBIN, HEAP)
            END
        `);
        
        console.log('✅ Dashboard tables seeded.');
        process.exit(0);

    } catch (err) {
        console.error('Error seeding dashboards:', err);
        process.exit(1);
    }
}

seedDashboards();
