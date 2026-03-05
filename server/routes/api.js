const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// Health Check
router.get('/health', async (req, res) => {
    res.json({ status: 'API Online', timestamp: new Date() });
});

// Test DB Connection
router.get('/test-db', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT @@VERSION as version');
        res.json({ 
            success: true, 
            version: result.recordset[0].version,
            message: 'Connected to Synapse successfully' 
        });
    } catch (err) {
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

/**
 * GET /hierarchy
 * Returns the portfolio and building hierarchy.
 * Structure: [{ name: "PortfolioA", buildings: [{ code: "B1", name: "Building 1" }, ...] }, ...]
 */
router.get('/hierarchy', async (req, res) => {
    try {
        const pool = await poolPromise;
        const query = `
            SELECT DISTINCT
                p.PortfolioName,
                p.BuildingCode,
                b.BuildingName
            FROM dbo.DW_D_Portfolio_New p
            LEFT JOIN dbo.DW_D_BuildingName b ON p.BuildingCode = b.BuildingCode
            WHERE p.PortfolioName IS NOT NULL
            ORDER BY p.PortfolioName, b.BuildingName
        `;
        const result = await pool.request().query(query);
        
        // Group buildings by Portfolio
        const hierarchy = {};
        result.recordset.forEach(row => {
            if (!hierarchy[row.PortfolioName]) {
                hierarchy[row.PortfolioName] = {
                    name: row.PortfolioName,
                    buildings: []
                };
            }
            if (row.BuildingCode) {
                hierarchy[row.PortfolioName].buildings.push({
                    code: row.BuildingCode,
                    name: row.BuildingName || row.BuildingCode // Fallback if name is missing
                });
            }
        });

        res.json({
            success: true,
            data: Object.values(hierarchy)
        });
    } catch (err) {
        console.error('Error fetching hierarchy:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch hierarchy', details: err.message });
    }
});

/**
 * GET /buildings/list
 * Returns all buildings from DW_D_BuildingName.
 * Response: { success: true, data: [{ code, name }, ...] }
 */
router.get('/buildings/list', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT BuildingCode as code, BuildingName as name
            FROM dbo.DW_D_BuildingName
            WHERE BuildingCode IS NOT NULL
            ORDER BY BuildingName
        `);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error fetching buildings list:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch buildings', details: err.message });
    }
});

/**
 * GET /buildings/:code/tags
 * Returns physical (PTag) and virtual (VTag) tags for a specific building.
 */
router.get('/buildings/:code/tags', async (req, res) => {
    const { code } = req.params;
    try {
        const pool = await poolPromise;
        
        // Physical Tags (PTag)
        // Adjust column selection based on actual schema inspection
        const pTagsQuery = `
            SELECT 
                Name, 
                Code, 
                System, 
                UOM, 
                F_tablename,
                Commodity
            FROM dbo.DW_D_EAPtag
            WHERE Building = @code
        `;
        
        const pTagsResult = await pool.request()
            .input('code', sql.NVarChar, code)
            .query(pTagsQuery);

        // Virtual Tags (Placeholder until table is created by DBA)
        // When ready, query: SELECT * FROM App_VirtualTags WHERE building_code = @code
        const vTags = []; 

        res.json({
            success: true,
            data: {
                physicalTags: pTagsResult.recordset,
                virtualTags: vTags
            }
        });
    } catch (err) {
        console.error(`Error fetching tags for building ${code}:`, err);
        res.status(500).json({ success: false, error: 'Failed to fetch tags', details: err.message });
    }
});

// List Database Tables (Dev only)
router.get('/tables', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT s.name as SchemaName, t.name as TableName
            FROM sys.tables t
            JOIN sys.schemas s ON t.schema_id = s.schema_id
            ORDER BY s.name, t.name
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /tags/search
 * Search DW_D_EAPtag for tags matching given filters.
 * Query Params:
 *  - q:         (Optional) Keyword to search in Name/Code
 *  - building:  (Optional) Building code filter
 *  - system:    (Optional) System filter
 *  - commodity: (Optional) Commodity filter
 *  - limit:     (Optional, default 50) Max results
 */
router.get('/tags/search', async (req, res) => {
    const { q, building, system, commodity, limit } = req.query;
    const maxRows = Math.min(parseInt(limit) || 50, 200);

    try {
        const pool = await poolPromise;
        const request = pool.request();

        let conditions = [];

        if (q) {
            request.input('q', sql.NVarChar, `%${q}%`);
            conditions.push('(Name LIKE @q OR Code LIKE @q)');
        }
        if (building) {
            request.input('building', sql.NVarChar, building);
            conditions.push('Building = @building');
        }
        if (system) {
            request.input('system', sql.NVarChar, system);
            conditions.push('System = @system');
        }
        if (commodity) {
            request.input('commodity', sql.NVarChar, commodity);
            conditions.push('Commodity = @commodity');
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const query = `
            SELECT TOP ${maxRows}
                Name, Code, System, UOM, F_tablename, Commodity, Building
            FROM dbo.DW_D_EAPtag
            ${whereClause}
            ORDER BY Building, System, Name
        `;

        const result = await request.query(query);

        // Also get total count (for pagination info)
        const countQuery = `
            SELECT COUNT(*) as total FROM dbo.DW_D_EAPtag ${whereClause}
        `;
        const countReq = pool.request();
        if (q) countReq.input('q', sql.NVarChar, `%${q}%`);
        if (building) countReq.input('building', sql.NVarChar, building);
        if (system) countReq.input('system', sql.NVarChar, system);
        if (commodity) countReq.input('commodity', sql.NVarChar, commodity);

        const countResult = await countReq.query(countQuery);

        res.json({
            success: true,
            data: {
                tags: result.recordset,
                total: countResult.recordset[0].total
            }
        });
    } catch (err) {
        console.error('Error searching tags:', err);
        res.status(500).json({ success: false, error: 'Failed to search tags', details: err.message });
    }
});

/**
 * GET /tags/filters
 * Returns distinct filter options for building, system, commodity.
 */
router.get('/tags/filters', async (req, res) => {
    try {
        const pool = await poolPromise;
        const [systems, commodities, buildings] = await Promise.all([
            pool.request().query(`SELECT DISTINCT System FROM dbo.DW_D_EAPtag WHERE System IS NOT NULL ORDER BY System`),
            pool.request().query(`SELECT DISTINCT Commodity FROM dbo.DW_D_EAPtag WHERE Commodity IS NOT NULL ORDER BY Commodity`),
            pool.request().query(`SELECT DISTINCT Building FROM dbo.DW_D_EAPtag WHERE Building IS NOT NULL ORDER BY Building`),
        ]);

        res.json({
            success: true,
            data: {
                systems: systems.recordset.map(r => r.System),
                commodities: commodities.recordset.map(r => r.Commodity),
                buildings: buildings.recordset.map(r => r.Building),
            }
        });
    } catch (err) {
        console.error('Error fetching tag filters:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch tag filters', details: err.message });
    }
});

/**
 * GET /readings
 * Fetches time-series data for one or more tags.
 * Query Params:
 *  - code:        Single tag code (legacy support)
 *  - codes:       Comma-separated tag codes (multi-series)
 *  - startDate:   (Optional) ISO start date
 *  - endDate:     (Optional) ISO end date
 *  - limit:       (Optional, default 1000) Max rows per series
 *  - aggregation: (Optional, default 'raw') raw|hourly|daily|weekly|monthly
 */
router.get('/readings', async (req, res) => {
    const { code, codes, startDate, endDate, limit, aggregation } = req.query;
    const maxRows = Math.min(parseInt(limit) || 1000, 10000);
    const aggMode = aggregation || 'raw';

    // Support both single code and multi-code
    const tagCodes = codes
        ? codes.split(',').map(c => c.trim()).filter(Boolean)
        : code
            ? [code]
            : [];

    if (tagCodes.length === 0) {
        return res.status(400).json({ error: 'Missing required query parameter: code or codes' });
    }

    if (tagCodes.length > 10) {
        return res.status(400).json({ error: 'Maximum 10 tags allowed per request' });
    }

    try {
        const pool = await poolPromise;

        // Helper: convert ISO date to DateKey integer
        const toDateKey = (isoDate) => {
            const d = new Date(isoDate);
            return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
        };

        // Helper: build aggregation SELECT
        const buildAggSelect = (agg, tableAlias) => {
            switch (agg) {
                case 'hourly':
                    return `DATEADD(HOUR, DATEDIFF(HOUR, 0, timestamp), 0) as timestamp, AVG(MeterReadings) as value`;
                case 'daily':
                    return `CAST(timestamp AS DATE) as timestamp, AVG(MeterReadings) as value`;
                case 'weekly':
                    return `DATEADD(WEEK, DATEDIFF(WEEK, 0, CAST(timestamp AS DATE)), 0) as timestamp, AVG(MeterReadings) as value`;
                case 'monthly':
                    return `DATEFROMPARTS(YEAR(timestamp), MONTH(timestamp), 1) as timestamp, AVG(MeterReadings) as value`;
                default: // raw
                    return `timestamp, MeterReadings as value`;
            }
        };

        const buildGroupBy = (agg) => {
            switch (agg) {
                case 'hourly':
                    return `GROUP BY DATEADD(HOUR, DATEDIFF(HOUR, 0, timestamp), 0)`;
                case 'daily':
                    return `GROUP BY CAST(timestamp AS DATE)`;
                case 'weekly':
                    return `GROUP BY DATEADD(WEEK, DATEDIFF(WEEK, 0, CAST(timestamp AS DATE)), 0)`;
                case 'monthly':
                    return `GROUP BY DATEFROMPARTS(YEAR(timestamp), MONTH(timestamp), 1)`;
                default:
                    return '';
            }
        };

        // Process each code concurrently
        const seriesPromises = tagCodes.map(async (tagCode) => {
            // 1. Lookup fact table
            const dimResult = await pool.request()
                .input('code', sql.NVarChar, tagCode)
                .query(`SELECT TOP 1 F_tablename, UOM FROM dbo.DW_D_EAPtag WHERE Code = @code`);

            if (dimResult.recordset.length === 0) {
                return { code: tagCode, error: 'Tag not found', data: [] };
            }

            const { F_tablename, UOM } = dimResult.recordset[0];

            if (!F_tablename || !/^[a-zA-Z0-9_]+$/.test(F_tablename)) {
                return { code: tagCode, error: 'Invalid or missing fact table', data: [] };
            }

            // 2. Build query
            const selectClause = buildAggSelect(aggMode);
            const groupClause = buildGroupBy(aggMode);
            const topClause = aggMode === 'raw' ? `TOP ${maxRows}` : '';

            let query = `
                SELECT ${topClause} ${selectClause}
                FROM dbo.[${F_tablename}]
                WHERE metercode = @code
            `;

            if (startDate) {
                query += ` AND DateKey >= ${toDateKey(startDate)}`;
            }
            if (endDate) {
                query += ` AND DateKey <= ${toDateKey(endDate)}`;
            }

            // Default range: last 3 months if no date given
            if (!startDate && !endDate) {
                const today = new Date();
                const threeMonthsAgo = new Date(today);
                threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                query += ` AND DateKey >= ${toDateKey(threeMonthsAgo.toISOString())}`;
            }

            query += ` ${groupClause}`;

            // Apply limit for aggregated queries
            if (aggMode !== 'raw') {
                query = `SELECT TOP ${maxRows} * FROM (${query}) sub ORDER BY timestamp ASC`;
            } else {
                query += ` ORDER BY timestamp ASC`;
            }

            const factResult = await pool.request()
                .input('code', sql.NVarChar, tagCode)
                .query(query);

            return {
                code: tagCode,
                uom: UOM,
                tableName: F_tablename,
                data: factResult.recordset
            };
        });

        const series = await Promise.all(seriesPromises);

        // If single code (legacy), return flat response compatible with old format
        if (tagCodes.length === 1 && !codes) {
            const s = series[0];
            return res.json({
                code: s.code,
                uom: s.uom,
                tableName: s.tableName,
                count: s.data.length,
                data: s.data
            });
        }

        // Multi-code: return series array
        res.json({
            success: true,
            series: series.map(s => ({
                code: s.code,
                uom: s.uom || '',
                tableName: s.tableName || '',
                count: s.data ? s.data.length : 0,
                data: s.data || [],
                error: s.error
            }))
        });

    } catch (err) {
        console.error('Error fetching readings:', err);
        res.status(500).json({ error: 'Failed to fetch readings', details: err.message });
    }
});

module.exports = router;

// ═══════════════════════════════════════════════════════════════
// WIDGETS & DASHBOARDS Persistence (App_Widgets, App_Dashboards)
// ═══════════════════════════════════════════════════════════════

// ── App_Widgets CRUD ───────────────────────────────────────────

// GET /widgets
router.get('/widgets', async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();
        let query = `SELECT * FROM App_Widgets WHERE 1=1`;
        
        if (req.query.building) {
            query += ` AND BuildingCode = @building`;
            request.input('building', sql.NVarChar, req.query.building);
        }
        
        const result = await request.query(query);
        const widgets = result.recordset.map(row => ({
            ...row,
            id: row.id.toString(), // Ensure ID is string for frontend
            config: JSON.parse(row.Config) // Parse stored JSON
        }));
        res.json({ success: true, data: widgets });
    } catch (err) {
        console.error('Error fetching widgets:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch widgets', details: err.message });
    }
});

// GET /widgets/:id
router.get('/widgets/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT * FROM App_Widgets WHERE id = @id`);
        
        if (result.recordset.length === 0) return res.status(404).json({ success: false, error: 'Widget not found' });
        
        const row = result.recordset[0];
        res.json({
            success: true,
            data: { ...row, id: row.id.toString(), config: JSON.parse(row.Config) }
        });
    } catch (err) {
        console.error('Error fetching widget:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch widget', details: err.message });
    }
});

// POST /widgets
router.post('/widgets', express.json(), async (req, res) => {
    try {
        const w = req.body; // Expects WidgetConfiguration
        const pool = await poolPromise;
        
        const query = `
            INSERT INTO App_Widgets (Name, WidgetScope, BuildingCode, BuildingName, PortfolioName, Config, CreatedBy, CreatedAt, UpdatedAt)
            OUTPUT INSERTED.id
            VALUES (@Name, @WidgetScope, @BuildingCode, @BuildingName, @PortfolioName, @Config, @CreatedBy, GETDATE(), GETDATE())
        `;
        
        const result = await pool.request()
            .input('Name', sql.NVarChar, w.name)
            .input('WidgetScope', sql.NVarChar, w.widgetScope || 'building')
            .input('BuildingCode', sql.NVarChar, w.buildingCode || null)
            .input('BuildingName', sql.NVarChar, w.buildingName || null)
            .input('PortfolioName', sql.NVarChar, w.portfolioName || null)
            .input('Config', sql.NVarChar, JSON.stringify(w)) // Store full config object
            .input('CreatedBy', sql.NVarChar, 'system') // Replace with user if auth available
            .query(query);
            
        const newId = result.recordset[0].id;
        
        res.status(201).json({ 
            success: true, 
            data: { ...w, id: newId.toString() } 
        });
    } catch (err) {
        console.error('Error saving widget:', err);
        res.status(500).json({ success: false, error: 'Failed to save widget', details: err.message });
    }
});

// PUT /widgets/:id
router.put('/widgets/:id', express.json(), async (req, res) => {
    try {
        const w = req.body;
        const pool = await poolPromise;
        
        const query = `
            UPDATE App_Widgets
            SET Name = @Name,
                WidgetScope = @WidgetScope,
                BuildingCode = @BuildingCode,
                BuildingName = @BuildingName,
                PortfolioName = @PortfolioName,
                Config = @Config,
                UpdatedAt = GETDATE()
            WHERE id = @id
        `;
        
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('Name', sql.NVarChar, w.name)
            .input('WidgetScope', sql.NVarChar, w.widgetScope || 'building')
            .input('BuildingCode', sql.NVarChar, w.buildingCode || null)
            .input('BuildingName', sql.NVarChar, w.buildingName || null)
            .input('PortfolioName', sql.NVarChar, w.portfolioName || null)
            .input('Config', sql.NVarChar, JSON.stringify(w))
            .query(query);
            
        res.json({ success: true, data: { ...w, id: req.params.id } });
    } catch (err) {
        console.error('Error updating widget:', err);
        res.status(500).json({ success: false, error: 'Failed to update widget', details: err.message });
    }
});

// DELETE /widgets/:id
router.delete('/widgets/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`DELETE FROM App_Widgets WHERE id = @id`);
            
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting widget:', err);
        res.status(500).json({ success: false, error: 'Failed to delete widget', details: err.message });
    }
});

// ── App_Dashboards CRUD ────────────────────────────────────────

// GET /dashboards
router.get('/dashboards', async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();
        let query = `SELECT * FROM App_Dashboards WHERE 1=1`;
        
        if (req.query.scope) {
            query += ` AND Scope = @scope`;
            request.input('scope', sql.NVarChar, req.query.scope);
        }
        if (req.query.building) {
            query += ` AND BuildingCode = @building`;
            request.input('building', sql.NVarChar, req.query.building);
        }
        if (req.query.portfolio) {
            query += ` AND PortfolioName = @portfolio`;
            request.input('portfolio', sql.NVarChar, req.query.portfolio);
        }
        
        const result = await request.query(query);
        const dashboards = result.recordset.map(row => ({
            ...row,
            id: row.id.toString(),
            layout: JSON.parse(row.Layout),
            widgets: JSON.parse(row.Widgets)
        }));
        res.json({ success: true, data: dashboards });
    } catch (err) {
        console.error('Error fetching dashboards:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboards', details: err.message });
    }
});

// GET /dashboards/:id
router.get('/dashboards/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`SELECT * FROM App_Dashboards WHERE id = @id`);
            
        if (result.recordset.length === 0) return res.status(404).json({ success: false, error: 'Dashboard not found' });
        
        const row = result.recordset[0];
        res.json({
            success: true,
            data: {
                ...row,
                id: row.id.toString(),
                layout: JSON.parse(row.Layout),
                widgets: JSON.parse(row.Widgets)
            }
        });
    } catch (err) {
        console.error('Error fetching dashboard:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard', details: err.message });
    }
});

// POST /dashboards
router.post('/dashboards', express.json(), async (req, res) => {
    try {
        const d = req.body;
        const pool = await poolPromise;
        const request = pool.request();
        
        // Uniqueness Check logic
        if (d.scope === 'portfolio-main' && d.portfolioName) {
            const check = await pool.request()
                .input('pName', sql.NVarChar, d.portfolioName)
                .query(`SELECT id FROM App_Dashboards WHERE Scope = 'portfolio-main' AND PortfolioName = @pName`);
            if (check.recordset.length > 0) return res.status(409).json({ error: 'Portfolio dashboard already exists' });
        }
        if (d.scope === 'building-main' && d.buildingCode) {
            const check = await pool.request()
                .input('bCode', sql.NVarChar, d.buildingCode)
                .query(`SELECT id FROM App_Dashboards WHERE Scope = 'building-main' AND BuildingCode = @bCode`);
            if (check.recordset.length > 0) return res.status(409).json({ error: 'Building dashboard already exists' });
        }

        const query = `
            INSERT INTO App_Dashboards (Name, Scope, PortfolioName, BuildingCode, BuildingName, Layout, Widgets, SortOrder, CreatedBy, CreatedAt, UpdatedAt)
            OUTPUT INSERTED.id
            VALUES (@Name, @Scope, @PortfolioName, @BuildingCode, @BuildingName, @Layout, @Widgets, @SortOrder, @CreatedBy, GETDATE(), GETDATE())
        `;
        
        const result = await request
            .input('Name', sql.NVarChar, d.name)
            .input('Scope', sql.NVarChar, d.scope)
            .input('PortfolioName', sql.NVarChar, d.portfolioName || null)
            .input('BuildingCode', sql.NVarChar, d.buildingCode || null)
            .input('BuildingName', sql.NVarChar, d.buildingName || null)
            .input('Layout', sql.NVarChar, JSON.stringify(d.layout || []))
            .input('Widgets', sql.NVarChar, JSON.stringify(d.widgets || []))
            .input('SortOrder', sql.Int, d.sortOrder || 0)
            .input('CreatedBy', sql.NVarChar, 'system')
            .query(query);
            
        const newId = result.recordset[0].id;
        res.status(201).json({ success: true, data: { ...d, id: newId.toString() } });
    } catch (err) {
        console.error('Error saving dashboard:', err);
        res.status(500).json({ success: false, error: 'Failed to save dashboard', details: err.message });
    }
});

// PUT /dashboards/:id
router.put('/dashboards/:id', express.json(), async (req, res) => {
    try {
        const d = req.body;
        const pool = await poolPromise;
        const query = `
            UPDATE App_Dashboards
            SET Name = @Name,
                Scope = @Scope,
                PortfolioName = @PortfolioName,
                BuildingCode = @BuildingCode,
                BuildingName = @BuildingName,
                Layout = @Layout,
                Widgets = @Widgets,
                SortOrder = @SortOrder,
                UpdatedAt = GETDATE()
            WHERE id = @id
        `;
        
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('Name', sql.NVarChar, d.name)
            .input('Scope', sql.NVarChar, d.scope)
            .input('PortfolioName', sql.NVarChar, d.portfolioName || null)
            .input('BuildingCode', sql.NVarChar, d.buildingCode || null)
            .input('BuildingName', sql.NVarChar, d.buildingName || null)
            .input('Layout', sql.NVarChar, JSON.stringify(d.layout || []))
            .input('Widgets', sql.NVarChar, JSON.stringify(d.widgets || []))
            .input('SortOrder', sql.Int, d.sortOrder || 0)
            .query(query);
            
        res.json({ success: true, data: { ...d, id: req.params.id } });
    } catch (err) {
        console.error('Error updating dashboard:', err);
        res.status(500).json({ success: false, error: 'Failed to update dashboard', details: err.message });
    }
});

// DELETE /dashboards/:id
router.delete('/dashboards/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`DELETE FROM App_Dashboards WHERE id = @id`);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting dashboard:', err);
        res.status(500).json({ success: false, error: 'Failed to delete dashboard', details: err.message });
    }
});