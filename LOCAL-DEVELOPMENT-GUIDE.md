# TCLD Dashboard - Local Development Setup Guide

This guide walks you through setting up the TCLD Dashboard on your local machine for development and testing.

## Prerequisites

### System Requirements
- Windows 10 or later (or macOS/Linux with equivalent tools)
- Administrator access (for installing ODBC driver)
- ~2GB free disk space

## Installation Steps

### 1. Install Python 3.12

1. Download Python 3.12 from https://www.python.org/downloads/
2. Run the installer
3. **Important**: Check the box "Add Python to PATH" during installation
4. Verify installation:
   ```powershell
   python --version
   # Should show: Python 3.12.x
   ```

### 2. Install ODBC Driver 17 for SQL Server

1. Download from: https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server
2. Select "ODBC Driver 17 for SQL Server" → Download for Windows
3. Run the installer and follow prompts
4. Verify installation:
   - Go to Control Panel → Administrative Tools → ODBC Data Sources
   - Check that "ODBC Driver 17 for SQL Server" is listed under "Drivers"

### 3. Clone and Navigate to Project

```powershell
cd c:\Users\leolkli\DataWrang\TCLD-CBSEMP-Dash
```

### 4. Create Python Virtual Environment (Recommended)

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

If you get an execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 5. Install Python Dependencies

```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

Expected packages:
- dash==2.14.1
- plotly==5.17.0
- pandas>=2.2.0
- pyodbc>=5.0.0
- python-dotenv==1.0.0
- gunicorn==21.2.0

## Configuration

### 6. Create Environment File

Create a `.env` file in the project root directory with your database credentials:

```
DB_SERVER=dev-saw-tcld-01.sql.azuresynapse.net
DB_NAME=tcld_syn_db_dev
DB_USER=readonlyappuser
DB_PASSWORD=sqHbKRVQmk7TYDyEXtfWG6
```

**Important**: Never commit `.env` to version control. It's already in `.gitignore`.

## Running the Application

### Start the Dashboard

```powershell
python app.py
```

Expected output:
```
Starting TCLD EA Ptag Dashboard...
Visit: http://localhost:8050
```

### Access the Dashboard

Open your web browser and visit:
```
http://localhost:8050
```

You should see:
- Dashboard title: "TCLD - EA Ptag Dashboard"
- Building dropdown (populated from database)
- Area dropdown (populated based on selected building)
- Performance tag data table

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'dash'"

**Solution**: Make sure virtual environment is activated and all dependencies are installed:
```powershell
pip install -r requirements.txt
```

### Issue: "Failed to find attribute 'server' in 'app'"

**Solution**: This is a gunicorn-specific error. For local development, just run `python app.py`. The `server` attribute is only needed for Azure deployment.

### Issue: "pyodbc.Error: ('IM002', '[IM002] [Microsoft][ODBC Driver Manager] Data source name not found and no default driver specified"

**Solution**: ODBC Driver 17 is not installed properly:
1. Uninstall ODBC Driver 17 from Control Panel → Programs and Features
2. Download and reinstall from: https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server
3. Restart your computer
4. Retry

### Issue: "Database connection error: [Microsoft][ODBC Driver 17 for SQL Server]TCP Provider: No such host is known."

**Solution**: Database server address is incorrect or network is not accessible:
1. Verify `DB_SERVER` in `.env` is correct
2. Test network connectivity:
   ```powershell
   Test-NetConnection dev-saw-tcld-01.sql.azuresynapse.net -Port 1433
   ```
3. Check firewall rules allow connection to the database server

### Issue: "Database connection error: Login failed for user 'readonlyappuser'"

**Solution**: Database credentials are incorrect:
1. Verify `DB_USER` and `DB_PASSWORD` in `.env` are correct
2. Confirm the user has SELECT permissions on the required tables:
   - dbo.DW_D_Building
   - dbo.DW_D_Area
   - dbo.DW_F_Performance_Tag (or equivalent)
3. Contact database administrator if permissions are missing

### Issue: "No data displayed in dropdowns or table"

**Solution**: Database connection succeeded but tables/data are empty:
1. Check Azure Portal to verify database has data in the tables
2. Run manual query to test:
   ```powershell
   python -c "from database import test_connection; print(test_connection())"
   ```
3. Check app logs in browser console (F12 → Console tab)

## Development Tips

### Enable Debug Mode

Open `app.py` and change:
```python
app.run(debug=True, host="0.0.0.0", port=8050)
```

This enables hot-reload and better error messages.

### Check Database Connection

Run the diagnostic script:
```powershell
python diagnose.py
```

### View Application Logs

Check console output while the app is running. All database errors will be logged there.

### Update Dependencies

If you need to add new packages:
```powershell
pip install <package_name>
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Add new dependency"
git push
```

## File Structure

```
TCLD-CBSEMP-Dash/
├── app.py                 # Main Dash application
├── database.py            # Database connection module
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (local only)
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions CI/CD
├── assets/
│   ├── dashboard.css      # Styling
│   └── styles.py          # Python styling
└── README.md              # Project documentation
```

## Next Steps

1. ✅ Install Python 3.12
2. ✅ Install ODBC Driver 17
3. ✅ Create virtual environment
4. ✅ Install dependencies
5. ✅ Create `.env` file with credentials
6. ✅ Run `python app.py`
7. ✅ Visit http://localhost:8050

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Azure Portal for database status
3. Check GitHub Actions logs for deployment issues
4. Contact your database administrator for access issues

## Additional Resources

- **Dash Documentation**: https://dash.plotly.com/
- **Plotly Charts**: https://plotly.com/python/
- **PyODBC**: https://github.com/mkleehammer/pyodbc
- **Azure Synapse**: https://learn.microsoft.com/en-us/azure/synapse-analytics/
