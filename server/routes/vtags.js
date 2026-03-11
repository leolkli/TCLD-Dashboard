const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

function getHKDateStr(input) {
    if (input && typeof input === 'string') {
        // If it's already a clean YYYY-MM-DD or lacks 'Z', just parse it locally and append time
        if (input.length === 10) return input + ' 00:00:00';
    }
    let d = input ? new Date(input) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    
    // Add 8 hours to shift UTC to HK Time for formatting purposes
    const hkTime = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    return hkTime.toISOString().replace('T', ' ').replace('Z', '').substring(0, 23);
}

/**
 * GET /api/vtags
 * Get all virtual tags
 */
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT * FROM DW_D_EAVtag_Test
            WHERE Status = 'Active'
            ORDER BY Code
        `);
        // Map to expected frontend structure
        const vtags = result.recordset.map(row => ({
            id: row.Code,
            name: row.Name,
            systemCode: row.Code,
            description: row.Description,
            effectiveFrom: row.EffectiveFrom ? new Date(row.EffectiveFrom).toISOString().split('T')[0] : null,
            effectiveTo: row.EffectiveTo ? new Date(row.EffectiveTo).toISOString().split('T')[0] : null,
            dataType: row.IsAccumulated === 'TRUE' ? 'accumulated' : 'actual',
            calculationStep: row.CalculationStep || (row.F_tablename ? row.F_tablename.split('_').pop().toLowerCase() : 'raw'),
            calculationType: row.CalculationType,
            calculationLevel: row.CalculationLevel,
            formulaTokens: JSON.parse(row.FormulaJSON || '[]'),
            version: row.Version || 'v1',
            unit: row.ParameterOri,
            isAccumulated: row.IsAccumulated,
            status: row.Status || 'Active'
        }));

        res.json({ success: true, data: vtags });
    } catch (err) {
        console.error('Error fetching VTags:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch virtual tags', details: err.message });
    }
});

/**
 * GET /api/vtags/:id
 * Get a specific virtual tag by its code
 */
router.get('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Code', sql.NVarChar(255), req.params.id)
            .query(`
                SELECT TOP 1 * FROM DW_D_EAVtag_Test
                WHERE Code = @Code AND Status = 'Active'
                ORDER BY Version DESC
            `);
            
        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, error: 'Virtual tag not found' });
        }

        const row = result.recordset[0];
        const vtag = {
            id: row.Code,
            name: row.Name,
            systemCode: row.Code,
            description: row.Description,
            effectiveFrom: row.EffectiveFrom ? new Date(row.EffectiveFrom).toISOString().split('T')[0] : null,
            effectiveTo: row.EffectiveTo ? new Date(row.EffectiveTo).toISOString().split('T')[0] : null,
            dataType: row.IsAccumulated === 'TRUE' ? 'accumulated' : 'actual',
            calculationStep: row.CalculationStep || (row.F_tablename ? row.F_tablename.split('_').pop().toLowerCase() : 'raw'),
            calculationType: row.CalculationType,
            calculationLevel: row.CalculationLevel,
            formulaTokens: JSON.parse(row.FormulaJSON || '[]'),
            version: row.Version || 1,
            unit: row.ParameterOri,
            isAccumulated: row.IsAccumulated,
            status: row.Status || 'Active'
        };

        res.json({ success: true, data: vtag });
    } catch (err) {
        console.error('Error fetching VTag by ID:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch virtual tag details', details: err.message });
    }
});

/**
 * POST /api/vtags
 * Create a new virtual tag configuration
 */
router.post('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const data = req.body;

        // Auto-generate SystemCode if not provided or it's new
        let systemCode = data.systemCode || '';
        if (!systemCode || systemCode === 'System Generated on Save') {
            // Get the maximum VTAG code sequence from both Test and Production tables to ensure global uniqueness
            const codeRes = await pool.request().query(`
                SELECT MAX(MaxCode) as GlobalMax FROM (
                    SELECT MAX(TRY_CAST(SUBSTRING(Code, 6, 255) AS INT)) as MaxCode FROM DW_D_EAVtag WHERE Code LIKE 'VTAG_%'
                    UNION ALL
                    SELECT MAX(TRY_CAST(SUBSTRING(Code, 6, 255) AS INT)) as MaxCode FROM DW_D_EAVtag_Test WHERE Code LIKE 'VTAG_%'
                ) as CombinedMax
            `);
            let nextNum = 1;
            if (codeRes.recordset[0] && codeRes.recordset[0].GlobalMax) {
                nextNum = codeRes.recordset[0].GlobalMax + 1;
            }

            // Validate against the databases to ensure it doesn't already exist
            let isUnique = false;
            while (!isUnique) {
                systemCode = `VTAG_${nextNum.toString().padStart(3, '0')}`;
                const duplicateCheck = await pool.request()
                    .input('CheckCode', sql.NVarChar(255), systemCode)
                    .query(`
                        SELECT 
                            (SELECT COUNT(*) FROM DW_D_EAVtag WHERE Code = @CheckCode) + 
                            (SELECT COUNT(*) FROM DW_D_EAVtag_Test WHERE Code = @CheckCode) as TotalCount
                    `);

                if (duplicateCheck.recordset[0].TotalCount === 0) {
                    isUnique = true;
                } else {
                    nextNum++;
                }
            }
        }

        // Parse Vtag Name for building information (e.g. "HK\\1PP\\DV\\TT\\KPI\\kWh")
        const nameParts = (data.name || '').split('\\');
        let region = null, building = null, area = null, systemName = null, puq = null, parameterOri = null;
        if (nameParts.length >= 6) {
            region = nameParts[0];
            building = nameParts[1];
            area = nameParts[2];
            systemName = nameParts[3];
            puq = nameParts[4];
            parameterOri = nameParts[5];
        }

        // F_tablename routing logic based on the extracted building from the Vtag Name
        const fTableName = building ? `DW_F_EAVtag_${building}` : 'DW_F_EAVtag_Unknown';

        // Check if vtag with this CODE already exists to do Versioning (UPSERT)
        let existCheck;
        if (data.systemCode && data.systemCode !== 'System Generated on Save') {
            existCheck = await pool.request()
                .input('Code', sql.NVarChar(255), data.systemCode)
                .query(`SELECT TOP 1 * FROM DW_D_EAVtag_Test WHERE Code = @Code ORDER BY Version DESC`);
        } else {
            existCheck = await pool.request()
                .input('Name', sql.NVarChar(255), data.name)
                .query(`SELECT TOP 1 * FROM DW_D_EAVtag_Test WHERE Name = @Name ORDER BY Version DESC`);
        }

        if (existCheck.recordset.length > 0) {
            const oldRecord = existCheck.recordset[0];
            systemCode = oldRecord.Code;

            // Check if any critical fields have changed to warrant a new version
            const newFormulaJSON = JSON.stringify(data.formulaTokens || []);
            const newIsAccumulated = data.dataType === 'accumulated' ? 'TRUE' : 'FALSE';
            const newEffectiveFromStr = getHKDateStr(data.effectiveFrom).split(' ')[0];
            const newEffectiveToStr = data.effectiveTo ? getHKDateStr(data.effectiveTo).split(' ')[0] : '2999-12-31';

            const oldEffectiveFromStr = oldRecord.EffectiveFrom ? new Date(oldRecord.EffectiveFrom).toISOString().split('T')[0] : '';
            const oldEffectiveToStr = oldRecord.EffectiveTo ? new Date(oldRecord.EffectiveTo).toISOString().split('T')[0] : '';

            const isNameChanged = oldRecord.Name !== data.name;
            const isEffectiveFromChanged = oldEffectiveFromStr !== newEffectiveFromStr;
            
            console.log('--- DB Save Debug ---');
            console.log('Incoming From:', data.effectiveFrom, '=> Output:', getHKDateStr(data.effectiveFrom));
            console.log('Incoming To:', data.effectiveTo, '=> Output:', data.effectiveTo ? getHKDateStr(data.effectiveTo) : '2999-12-31');
            console.log('Generated Timestamp:', getHKDateStr());
            console.log('---------------------');
            const isEffectiveToChanged = oldEffectiveToStr !== newEffectiveToStr;
            const isDataTypeChanged = oldRecord.IsAccumulated !== newIsAccumulated;
            const isCalcStepChanged = oldRecord.CalculationStep !== data.calculationStep;
            const isCalcTypeChanged = oldRecord.CalculationType !== data.calculationType;
            const isFormulaChanged = oldRecord.FormulaJSON !== newFormulaJSON;

            const needsNewVersion = isNameChanged || isEffectiveFromChanged || isEffectiveToChanged || 
                                    isDataTypeChanged || isCalcStepChanged || isCalcTypeChanged || isFormulaChanged;

            if (needsNewVersion) {
                // Versioning: Mark old as Inactive, insert new with Version + 1
                const newVersion = (oldRecord.Version || 1) + 1;
                
                // Mark older versions as Inactive
                await pool.request()
                    .input('Code', sql.NVarChar(255), systemCode)
                    .query(`
                        UPDATE DW_D_EAVtag_Test
                        SET Status = 'Inactive', EffectiveTo = DATEADD(hour, 8, GETUTCDATE())
                        WHERE Code = @Code AND Status = 'Active'
                    `);

                // Insert new version
                await pool.request()
                    .input('Name', sql.NVarChar(255), data.name)
                    .input('Code', sql.NVarChar(255), systemCode)
                    .input('Region', sql.NVarChar(255), region)
                    .input('Building', sql.NVarChar(255), building)
                    .input('Area', sql.NVarChar(255), area)
                    .input('System', sql.NVarChar(255), systemName)
                    .input('PUQ', sql.NVarChar(255), puq)
                    .input('ParameterOri', sql.NVarChar(255), parameterOri)
                    .input('CalculationType', sql.NVarChar(255), data.calculationType)
                    .input('CalculationStep', sql.NVarChar(255), data.calculationStep)
                    .input('IsAccumulated', sql.NVarChar(255), data.dataType === 'accumulated' ? 'TRUE' : 'FALSE')
                    .input('F_tablename', sql.NVarChar(255), fTableName)
                    .input('Version', sql.Int, newVersion)
                    .input('Description', sql.NVarChar(4000), data.description || null)
                    .input('EffectiveFrom', sql.NVarChar(50), getHKDateStr(data.effectiveFrom))
                    .input('EffectiveTo', sql.NVarChar(50), data.effectiveTo ? getHKDateStr(data.effectiveTo) : '2999-12-31 00:00:00')
                    .input('CalculationLevel', sql.Int, data.calculationLevel || 1)
                    .input('FormulaJSON', sql.NVarChar(4000), JSON.stringify(data.formulaTokens || []))
                    .input('LastUpdateDate', sql.NVarChar(50), getHKDateStr())
                    .input('LastUpdateBy', sql.NVarChar(255), 'system')
                    .input('Status', sql.NVarChar(50), data.status || 'Active')
                    .query(`
                        INSERT INTO DW_D_EAVtag_Test (
                            [Name], [Code], [Region], [Building], [Area], [System], [PUQ], [ParameterOri],
                            [CalculationType], [CalculationStep], [IsAccumulated], [F_tablename], 
                            [Version], [Description], [EffectiveFrom], [EffectiveTo], 
                            [CalculationLevel], [FormulaJSON], [LastUpdateDate], [LastUpdateBy], [Status]
                        )
                        VALUES (
                            @Name, @Code, @Region, @Building, @Area, @System, @PUQ, @ParameterOri,
                            @CalculationType, @CalculationStep, @IsAccumulated, @F_tablename, 
                            @Version, @Description, @EffectiveFrom, @EffectiveTo, 
                            @CalculationLevel, @FormulaJSON, @LastUpdateDate, @LastUpdateBy, @Status
                        )
                    `);
            } else {
                // No core fields changed. Just update Description/UpdateDate/By for current version if needed
                await pool.request()
                    .input('Code', sql.NVarChar(255), systemCode)
                    .input('Description', sql.NVarChar(4000), data.description || null)
                    .query(`
                        UPDATE DW_D_EAVtag_Test
                        SET Description = @Description,
                            LastUpdateDate = DATEADD(hour, 8, GETUTCDATE()),
                            LastUpdateBy = 'system'
                        WHERE Code = @Code AND Status = 'Active'
                    `);
            }
        } else {
            // INSERTING new Vtag
            console.log('--- DB Create New Debug ---');
            console.log('Incoming From:', data.effectiveFrom, '=> Output:', getHKDateStr(data.effectiveFrom));
            console.log('Incoming To:', data.effectiveTo, '=> Output:', data.effectiveTo ? getHKDateStr(data.effectiveTo) : '2999-12-31 00:00:00');
            console.log('---------------------');
            
            await pool.request()
                .input('Name', sql.NVarChar(255), data.name)
                .input('Code', sql.NVarChar(255), systemCode)
                .input('Region', sql.NVarChar(255), region)
                .input('Building', sql.NVarChar(255), building)
                .input('Area', sql.NVarChar(255), area)
                .input('System', sql.NVarChar(255), systemName)
                .input('PUQ', sql.NVarChar(255), puq)
                .input('ParameterOri', sql.NVarChar(255), parameterOri)
                .input('CalculationType', sql.NVarChar(255), data.calculationType)
                .input('CalculationStep', sql.NVarChar(255), data.calculationStep)
                .input('IsAccumulated', sql.NVarChar(255), data.dataType === 'accumulated' ? 'TRUE' : 'FALSE')
                .input('F_tablename', sql.NVarChar(255), fTableName)
                .input('Version', sql.Int, 1) // Initial version
                .input('Description', sql.NVarChar(4000), data.description || null)
                .input('EffectiveFrom', sql.NVarChar(50), getHKDateStr(data.effectiveFrom))
                .input('EffectiveTo', sql.NVarChar(50), data.effectiveTo ? getHKDateStr(data.effectiveTo) : '2999-12-31 00:00:00')
                .input('CalculationLevel', sql.Int, data.calculationLevel || 1)
                .input('FormulaJSON', sql.NVarChar(4000), JSON.stringify(data.formulaTokens || []))
                .input('LastUpdateDate', sql.NVarChar(50), getHKDateStr())
                .input('LastUpdateBy', sql.NVarChar(255), 'system') // In real scenario, user ID from token
                .input('Status', sql.NVarChar(50), data.status || 'Active')
                .query(`
                    INSERT INTO DW_D_EAVtag_Test (
                        [Name], [Code], [Region], [Building], [Area], [System], [PUQ], [ParameterOri],
                        [CalculationType], [CalculationStep], [IsAccumulated], [F_tablename], 
                        [Version], [Description], [EffectiveFrom], [EffectiveTo], 
                        [CalculationLevel], [FormulaJSON], [LastUpdateDate], [LastUpdateBy], [Status]
                    )
                    VALUES (
                        @Name, @Code, @Region, @Building, @Area, @System, @PUQ, @ParameterOri,
                        @CalculationType, @CalculationStep, @IsAccumulated, @F_tablename, 
                        @Version, @Description, @EffectiveFrom, @EffectiveTo, 
                        @CalculationLevel, @FormulaJSON, @LastUpdateDate, @LastUpdateBy, @Status
                    )
                `);
        }

        res.json({ success: true, data: { ...data, systemCode } });
    } catch (err) {
        console.error('Error creating VTag:', err);
        res.status(500).json({ success: false, error: 'Failed to create virtual tag', details: err.message });
    }
});

/**
 * DELETE /api/vtags/:id
 * Soft delete a virtual tag
 */
router.delete('/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Code', sql.NVarChar(255), req.params.id)
            .query(`
                UPDATE DW_D_EAVtag_Test
                SET Status = 'Inactive', EffectiveTo = DATEADD(hour, 8, GETUTCDATE())
                WHERE Code = @Code AND Status = 'Active'
            `);
            
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, error: 'Virtual tag not found or already inactive' });
        }

        res.json({ success: true, message: 'Virtual tag deleted successfully' });
    } catch (err) {
        console.error('Error deleting VTag:', err);
        res.status(500).json({ success: false, error: 'Failed to delete virtual tag', details: err.message });
    }
});

/**
 * GET /api/vtags/:id/history
 * Get history of a virtual tag
 */
router.get('/:id/history', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Code', sql.NVarChar(255), req.params.id)
            .query(`
                SELECT * FROM DW_D_EAVtag_Test
                WHERE Code = @Code
                ORDER BY Version DESC
            `);

        // Map to frontend structure
        const history = result.recordset.map(row => ({
            id: row.Code,
            name: row.Name,
            systemCode: row.Code,
            description: row.Description,
            effectiveFrom: row.EffectiveFrom ? new Date(row.EffectiveFrom).toISOString().split('T')[0] : null,
            effectiveTo: row.EffectiveTo ? new Date(row.EffectiveTo).toISOString().split('T')[0] : null,
            dataType: row.IsAccumulated === 'TRUE' ? 'accumulated' : 'actual',
            calculationStep: row.CalculationStep || (row.F_tablename ? row.F_tablename.split('_').pop().toLowerCase() : 'raw'),
            calculationType: row.CalculationType,
            calculationLevel: row.CalculationLevel,
            formulaTokens: JSON.parse(row.FormulaJSON || '[]'),
            version: row.Version || 1,
            unit: row.ParameterOri,
            isAccumulated: row.IsAccumulated,
            status: row.Status || 'Inactive'
        }));

        res.json({ success: true, data: history });
    } catch (err) {
        console.error('Error fetching VTag history:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch virtual tag history', details: err.message });
    }
});

module.exports = router;