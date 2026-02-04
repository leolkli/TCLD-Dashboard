# TCLD CBSEMP Dash Dashboard

## Project Structure

```
TCLD-CBSEMP-Dash/
├── app.py                    # Main Dash application
├── database.py               # Database connection & queries
├── requirements.txt          # Python dependencies
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore file
├── assets/
│   └── dashboard.css        # Custom CSS styling
├── data/                    # Data storage (optional)
├── README.md               # This file
├── QUICKSTART.md           # Quick setup guide
├── LOCAL-SETUP.md          # Detailed setup guide
└── DEPLOYMENT.md           # Azure deployment guide
```

## Overview

TCLD EA Ptag Dashboard is a Python-based web application built with **Dash** (Plotly) that visualizes Energy Analytics data from Azure SQL Database.

### Features

✅ Real-time connection to Azure SQL (dev-saw-tcld-01)
✅ Building and Area filtering
✅ Interactive charts (line and box plots)
✅ Metrics cards (total, average, peak, lowest consumption)
✅ Data table with pagination
✅ Responsive mobile-friendly design
✅ Professional styling

## Technology Stack

- **Framework**: Dash (Python web framework by Plotly)
- **Database**: Azure SQL Server (pyodbc)
- **Charting**: Plotly
- **Data Processing**: Pandas
- **Deployment**: Azure App Service / Container

## Prerequisites

### Python
- Python 3.8 or higher
- pip (comes with Python)

### Database
- Azure SQL credentials for `dev-saw-tcld-01`
- Database name, username, and password

### System
- Windows 10/11
- Internet connection
- VS Code (optional but recommended)

## Installation

### Step 1: Install Python Dependencies

```bash
cd c:\Users\leolkli\DataWrang\TCLD-CBSEMP-Dash
pip install -r requirements.txt
```

### Step 2: Configure Environment

```bash
# Copy template
copy .env.example .env

# Edit .env with your credentials
notepad .env
```

Update these values:
```env
DB_SERVER=dev-saw-tcld-01.database.windows.net
DB_NAME=your_actual_database_name
DB_USER=your_username
DB_PASSWORD=your_password
```

### Step 3: Install ODBC Driver (Windows Only)

If you don't have ODBC Driver 17 for SQL Server:

1. Download: [Microsoft ODBC Driver 17 for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)
2. Run installer with default settings
3. Restart computer

## Running Locally

```bash
# Navigate to project
cd c:\Users\leolkli\DataWrang\TCLD-CBSEMP-Dash

# Start the dashboard
python app.py
```

Then open: **http://localhost:8050**

## Project Structure Explained

### `app.py` - Main Application
- Dash app setup
- Layout definition (UI structure)
- Callbacks (interactive functionality)

### `database.py` - Database Module
- Connection management
- SQL queries for:
  - Buildings list
  - Areas list
  - EA Ptag data with filters
  - Dashboard metrics

### `assets/dashboard.css` - Styling
- Custom CSS for professional appearance
- Responsive design for mobile
- Color scheme and layout

## Database Tables Used

| Table | Purpose |
|-------|---------|
| `DW_F_EAPtag` | Fact table with measurements |
| `DW_D_Building` | Building dimension data |
| `DW_D_Area` | Area/location dimension data |

## Features Explained

### Filters
- **Building Dropdown**: Select building (optional)
- **Area Dropdown**: Select area within building (optional)
- **Date Range**: Filter by date range (default: last 30 days)
- **Refresh Button**: Reload all data

### Metrics Cards
- **Total Energy Consumption**: Sum of all values
- **Average Consumption**: Mean value
- **Peak Consumption**: Maximum value
- **Lowest Consumption**: Minimum value

### Charts
- **Consumption Over Time**: Line chart showing trend
- **Distribution by Building**: Box plot showing variance

### Data Table
- Recent 100 records matching filters
- Building, Area, Ptag, Value, Unit, Timestamp

## Troubleshooting

### Connection Error: "Database connection error"
- Check .env credentials
- Verify ODBC Driver 17 installed
- Ensure Azure SQL firewall allows your IP
- Test with: `python -c "from database import test_connection; print(test_connection())"`

### Error: "ModuleNotFoundError: No module named 'pyodbc'"
- Run: `pip install -r requirements.txt`
- Ensure you're in correct directory

### Port 8050 Already in Use
```bash
# Find process using port
netstat -ano | findstr :8050

# Kill process
taskkill /PID <PID> /F
```

### No Data Showing
- Verify database has records in `DW_F_EAPtag`
- Check if filters are too restrictive
- Review browser console for errors (F12)

## Deployment

### Local Development
- Run: `python app.py`
- Access: http://localhost:8050
- Hot reload enabled for development

### Azure App Service
See `DEPLOYMENT.md` for complete instructions

### Docker Container
```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

## Performance Tips

1. **Limit Data**: Use date range to limit query size
2. **Caching**: Add caching for frequently accessed data
3. **Indexing**: Ensure SQL tables have proper indexes
4. **Pagination**: Implement pagination for large datasets

## Security Considerations

1. ✅ **Never commit .env** with credentials
2. ✅ **Use Key Vault** for production secrets
3. ✅ **Enable HTTPS** for production
4. ✅ **SQL Firewall** restrict to Azure services only
5. ✅ **Input Validation** all user inputs

## Next Steps

1. ✅ Install Python dependencies: `pip install -r requirements.txt`
2. ✅ Configure .env with database credentials
3. ✅ Run locally: `python app.py`
4. ✅ Test dashboard at http://localhost:8050
5. ✅ Deploy to Azure (see DEPLOYMENT.md)

## Support Resources

- **Dash Docs**: https://dash.plotly.com
- **Plotly Docs**: https://plotly.com/python
- **Azure SQL**: https://learn.microsoft.com/en-us/azure/azure-sql
- **Python Docs**: https://docs.python.org

## License

© 2026 TCLD Technical Cloud. All rights reserved.

## Contributing

To modify the dashboard:
1. Edit `app.py` for layout changes
2. Edit `database.py` for query changes
3. Edit `assets/dashboard.css` for styling
4. Restart `python app.py` to see changes
