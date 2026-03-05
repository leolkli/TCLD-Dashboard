require('dotenv').config();

const config = {
    // If using Service Principal, provide clientId/clientSecret/tenantId
    // If using SQL Auth, provide user/password
    server: process.env.AZURE_SYNAPSE_SQL_ENDPOINT,
    database: process.env.AZURE_SYNAPSE_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true,
        connectTimeout: 30000 
    }
};

if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
    // Service Principal Authentication
    config.authentication = {
        type: 'azure-active-directory-service-principal-secret',
        options: {
            clientId: process.env.AZURE_CLIENT_ID,
            clientSecret: process.env.AZURE_CLIENT_SECRET,
            tenantId: process.env.AZURE_TENANT_ID
        }
    };
} else {
    // SQL Authentication
    config.user = process.env.AZURE_SYNAPSE_USERNAME;
    config.password = process.env.AZURE_SYNAPSE_PASSWORD;
}

module.exports = config;