# Quick Start - Dash Dashboard (5 Minutes)

## Prerequisites

- ✅ Python 3.8+ installed
- ✅ pip installed (comes with Python)
- ✅ Azure SQL credentials

## Step 1: Verify Python Installation

```powershell
python --version
pip --version
```

Both should show version numbers (e.g., `Python 3.11.2`, `pip 23.1.2`)

## Step 2: Install ODBC Driver (Windows Only)

**Skip if already installed**

Download and install: [ODBC Driver 17 for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)

## Step 3: Setup Project

```powershell
# Navigate to project
cd c:\Users\leolkli\DataWrang\TCLD-CBSEMP-Dash

# Install dependencies
pip install -r requirements.txt
```

**Installation time**: 2-5 minutes

## Step 4: Configure Database

```powershell
# Copy template
copy .env.example .env

# Edit with your credentials
notepad .env
```

Update:
```env
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
```

## Step 5: Run Dashboard

```powershell
python app.py
```

**Expected output:**
```
Running on http://0.0.0.0:8050
```

**Open browser to:** http://localhost:8050

## Step 6: Test Connection

1. Look for "✓ Database Connected" message
2. Building dropdown should populate
3. Select building to load data

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError` | Run: `pip install -r requirements.txt` |
| Database connection fails | Check .env credentials |
| ODBC Driver not found | Install ODBC Driver 17 |
| Port 8050 in use | Kill process: `taskkill /PID <PID> /F` |

## Stop Dashboard

Press `Ctrl+C` in terminal

## Next Steps

- See `LOCAL-SETUP.md` for detailed guide
- See `DEPLOYMENT.md` for Azure deployment
- See `README.md` for full documentation

---

**Good luck!** 🚀
