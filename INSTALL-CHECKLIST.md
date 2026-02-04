# TCLD Dash Dashboard - Installation Checklist

## Software to Install (One-Time)

Send this to your IT department for installation:

```
==================================================
SOFTWARE INSTALLATION REQUEST
==================================================

Project: TCLD EA Ptag Dashboard (Python/Dash)
User: [Your Name]
Date: February 4, 2026

REQUIRED SOFTWARE:

1. Python 3.11 LTS
   - Download: https://www.python.org/downloads/
   - Version: 3.11.x or 3.12.x
   - Installation: Default settings, CHECK "Add Python to PATH"
   - Admin Rights: Yes
   - Disk Space: ~100 MB

2. ODBC Driver 17 for SQL Server
   - Download: https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server
   - Installation: Default settings
   - Admin Rights: Yes
   - Purpose: Connects to Azure SQL Server

NOTES:
- pip comes automatically with Python
- Both are required for dashboard to work
- Total installation time: ~10 minutes
- Total disk space needed: ~200 MB

VERIFICATION COMMANDS (after install):
  python --version     (should show v3.11.x or v3.12.x)
  pip --version        (should show v23.x or later)

==================================================
```

## After Installation: Setup (5 Minutes)

### 1. Check Installation
```powershell
python --version
pip --version
```

### 2. Navigate to Project
```powershell
cd c:\Users\leolkli\DataWrang\TCLD-CBSEMP-Dash
```

### 3. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 4. Configure Database
```powershell
copy .env.example .env
notepad .env
```

Update with your credentials:
```env
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
```

### 5. Run Dashboard
```powershell
python app.py
```

Open browser to: **http://localhost:8050**

## What's Installed

### Python Packages (via pip install)

```
dash==2.14.1              # Web framework
plotly==5.17.0            # Charts
pandas==2.0.3             # Data processing
pyodbc==4.0.37            # SQL connection
python-dotenv==1.0.0      # Config management
gunicorn==21.2.0          # Production server
```

### System Software

```
Python 3.11+              # Runtime
ODBC Driver 17            # SQL Server connection
```

## Project Structure After Setup

```
TCLD-CBSEMP-Dash/
├── app.py                 # Main app (ready to run)
├── database.py            # Database module
├── requirements.txt       # List of packages to install
├── .env                   # Your config (CREATE THIS)
├── .env.example          # Config template (reference)
├── assets/
│   └── dashboard.css     # Styling
├── README.md             # Full documentation
├── QUICKSTART.md         # 5-minute guide
├── LOCAL-SETUP.md        # Detailed guide
├── DEPLOYMENT.md         # Azure deployment
└── SETUP-COMPLETE.md     # This checklist
```

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| Python not found | Install from python.org, restart computer |
| pip install fails | Check internet, try: `pip install --upgrade pip` |
| Database connection error | Verify .env credentials, check ODBC driver |
| Port 8050 in use | Kill process: `taskkill /PID <PID> /F` |
| ODBC Driver not found | Install from Microsoft, restart computer |
| ModuleNotFoundError | Run: `pip install -r requirements.txt` |

## File Descriptions

### Core Files
- **app.py** (500 lines) - Main Dash application with all callbacks
- **database.py** (200 lines) - SQL connection and query functions

### Configuration
- **requirements.txt** - All Python dependencies to install
- **.env** - Your database credentials (you create this)
- **.env.example** - Template showing what values go in .env

### Documentation
- **README.md** - Full project documentation
- **QUICKSTART.md** - 5-minute quick start
- **LOCAL-SETUP.md** - Detailed step-by-step guide
- **DEPLOYMENT.md** - How to deploy to Azure
- **SETUP-COMPLETE.md** - This file

### Assets
- **assets/dashboard.css** - Custom styling for the dashboard

## Dashboard Features

✅ Building selector dropdown
✅ Area selector dropdown
✅ Date range filter
✅ 4 metric cards (total, average, peak, lowest)
✅ Line chart (consumption over time)
✅ Box plot (distribution)
✅ Data table (recent 100 records)
✅ Database connection status
✅ Responsive mobile design

## Environment Variables Needed

Create `.env` file with:

```env
# Database
DB_SERVER=dev-saw-tcld-01.database.windows.net
DB_NAME=your_actual_database_name
DB_USER=your_username
DB_PASSWORD=your_password

# Server
DASH_PORT=8050
DEBUG=True
```

## Performance

- Dashboard load: 2-5 seconds
- Chart update: 1-3 seconds
- Data table: 1-2 seconds

## Security Best Practices

✅ Never commit .env file (contains passwords)
✅ Use strong passwords (12+ characters)
✅ Enable SQL firewall (Azure only)
✅ Use Key Vault for production
✅ Enable HTTPS for production

## Support Resources

- Dash: https://dash.plotly.com
- Python: https://docs.python.org
- Azure SQL: https://learn.microsoft.com/en-us/azure/sql/

## Next Step

👉 **Give this checklist to your IT department**

They will install:
1. Python 3.11 LTS
2. ODBC Driver 17

Then you can follow the 5-minute setup above.

---

**Questions?** See README.md or LOCAL-SETUP.md
