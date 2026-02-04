# Local Development Setup - Detailed Guide

## Prerequisites

### Python Installation
1. Download from [python.org](https://www.python.org/downloads/)
2. Run installer
3. **Check**: Add Python to PATH
4. Click Install
5. Verify: `python --version`

### ODBC Driver (Windows Only)

**Why needed**: Connects to Azure SQL Server

1. Download: [ODBC Driver 17 for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)
2. Run installer
3. Accept defaults
4. Restart computer

**Verify installation:**
```powershell
Get-OdbcDriver -Name "ODBC Driver 17 for SQL Server"
```

## Step-by-Step Setup

### Step 1: Navigate to Project

```powershell
cd c:\Users\leolkli\DataWrang\TCLD-CBSEMP-Dash
```

### Step 2: Create Virtual Environment (Recommended)

```powershell
# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# You should see (venv) in your terminal
```

### Step 3: Install Dependencies

```powershell
pip install -r requirements.txt
```

**What's being installed:**
- `dash` - Web framework
- `plotly` - Interactive charts
- `pandas` - Data processing
- `pyodbc` - SQL connection
- `python-dotenv` - Environment variables
- `gunicorn` - Production server

### Step 4: Configure Environment Variables

```powershell
# Copy template
copy .env.example .env

# Open in notepad
notepad .env
```

**Update these fields:**
```env
DB_SERVER=dev-saw-tcld-01.database.windows.net
DB_NAME=your_actual_database_name
DB_USER=your_username
DB_PASSWORD=your_password
DASH_PORT=8050
DEBUG=True
```

**Save and close** (Ctrl+S, Alt+F4)

### Step 5: Test Database Connection

```powershell
python -c "from database import test_connection; print('Connected!' if test_connection() else 'Failed!')"
```

**Expected output:**
```
Connected!
```

If fails:
- Check .env credentials
- Verify ODBC Driver installed
- Check Azure SQL firewall allows your IP

### Step 6: Run the Dashboard

```powershell
python app.py
```

**Expected output:**
```
Running on http://0.0.0.0:8050
Dash is running on http://127.0.0.1:8050
```

### Step 7: Access Dashboard

Open browser: **http://localhost:8050**

You should see:
- ✓ Header: "TCLD - EA Ptag Dashboard"
- ✓ Filters section
- ✓ Connection status
- ✓ Metric cards
- ✓ Charts and data table

## Development Workflow

### Making Changes

**Frontend changes** (Layout, styling):
1. Edit `app.py` (the `app.layout` section)
2. Save file
3. Browser auto-reloads (in debug mode)

**Backend changes** (Database queries):
1. Edit `database.py`
2. Save file
3. Browser auto-reloads

**Styling changes**:
1. Edit `assets/dashboard.css`
2. Save file
3. Browser auto-reloads

### Testing API

Test database queries manually:
```powershell
python
>>> from database import get_buildings
>>> buildings = get_buildings()
>>> print(buildings)
```

## File Structure Reference

```
TCLD-CBSEMP-Dash/
├── app.py                  # Main application (1000+ lines)
├── database.py             # Database module (200+ lines)
├── requirements.txt        # Dependencies list
├── .env                    # Your configuration (CREATE THIS)
├── .env.example           # Configuration template
├── assets/
│   └── dashboard.css      # Styling
└── venv/                  # Virtual environment (if using)
```

## Troubleshooting

### Issue: "No module named 'dash'"

**Solution:**
```powershell
pip install -r requirements.txt
```

Make sure you're in the project directory.

### Issue: "Database connection failed"

```powershell
# Test manually
python
>>> from database import test_connection
>>> test_connection()
```

**If False:**
1. Check .env file exists
2. Verify credentials are correct
3. Ensure ODBC Driver 17 installed
4. Check Azure SQL firewall rules

### Issue: "ODBC Driver 17 not found"

**Solution:**
1. Download ODBC Driver: [link](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)
2. Run installer
3. Restart computer
4. Try again

### Issue: "Port 8050 already in use"

```powershell
# Find what's using the port
Get-NetTCPConnection -LocalPort 8050

# Kill the process
Stop-Process -Id <PID> -Force
```

### Issue: "No buildings showing in dropdown"

**Possible causes:**
- Database is empty
- Table names incorrect
- Connection isn't working

**Debug:**
```powershell
python
>>> from database import get_buildings
>>> buildings = get_buildings()
>>> print(buildings)
```

If None, database might be empty.

### Issue: "Timeout connecting to database"

**Solutions:**
1. Check network connection
2. Verify VPN is connected (if required)
3. Check Azure SQL firewall:
   - Go to Azure Portal
   - SQL Servers
   - Firewalls and virtual networks
   - Add your IP address
   - Or enable "Allow Azure services and resources"

## Performance Optimization

### Database Query Optimization
1. Add filters (date range, building) to limit data
2. Check SQL Server indexes
3. Use `LIMIT` in queries

### Frontend Performance
1. Reduce number of records displayed
2. Use date range filter
3. Enable browser caching

### Server Performance
1. Use production WSGI server (gunicorn)
2. Enable gzip compression
3. Use CDN for static assets

## Advanced Usage

### Custom Database Queries

Edit `database.py`:
```python
def get_custom_data():
    conn = get_connection()
    query = "SELECT * FROM YOUR_TABLE"
    df = pd.read_sql(query, conn)
    conn.close()
    return df.to_dict('records')
```

Then use in `app.py`:
```python
from database import get_custom_data

# In callback:
data = get_custom_data()
```

### Custom Styling

Edit `assets/dashboard.css`:
```css
.metric-card {
    background: #your-color;
    border: 2px solid #your-border;
}
```

Changes auto-apply in browser.

### Adding More Charts

In `app.py`, add callback:
```python
@app.callback(
    Output('new-chart', 'figure'),
    Input('refresh-button', 'n_clicks'),
)
def update_new_chart(n_clicks):
    # Your chart code
    fig = px.line(...)
    return fig
```

## Environment Variables

Available in `.env`:

| Variable | Purpose |
|----------|---------|
| `DB_SERVER` | Azure SQL server address |
| `DB_NAME` | Database name |
| `DB_USER` | SQL username |
| `DB_PASSWORD` | SQL password |
| `DASH_PORT` | Server port (default 8050) |
| `DEBUG` | Debug mode (True/False) |

## Security Best Practices

1. ✅ **Never commit .env** - Add to .gitignore
2. ✅ **Use strong passwords** - At least 12 characters
3. ✅ **Restrict SQL firewall** - Only allow Azure
4. ✅ **Enable HTTPS** - For production
5. ✅ **Rotate credentials** - Regularly change password
6. ✅ **Use Key Vault** - For production secrets

## Virtual Environment

### Why Use Virtual Environment?

- Isolated Python packages
- No conflicts with system Python
- Easy to share (requirements.txt)
- Easy to delete (just remove venv folder)

### Activate/Deactivate

```powershell
# Activate
.\venv\Scripts\Activate.ps1

# Deactivate (when done)
deactivate
```

## Next Steps

1. ✅ Run dashboard locally
2. ✅ Test with sample data
3. ✅ Customize as needed
4. ✅ Deploy to Azure (see DEPLOYMENT.md)

## Support

- **Dash Issues**: https://github.com/plotly/dash/discussions
- **SQL Issues**: https://learn.microsoft.com/en-us/sql/connect/odbc
- **Python Issues**: https://stackoverflow.com/questions/tagged/python

---

**Need help?** Check README.md or DEPLOYMENT.md
