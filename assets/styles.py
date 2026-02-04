"""
CSS Styling for TCLD Dash Dashboard
"""

# This file is loaded from assets folder and applied to the app
styles = """
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                 sans-serif;
    background-color: #f5f5f5;
    color: #333;
}

.app-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

/* Header */
.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.header-content p {
    font-size: 1rem;
    opacity: 0.9;
}

/* Main Container */
.main-container {
    flex: 1;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
}

/* Filters */
.filters-container {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    align-items: flex-end;
}

.filter-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.filter-item label {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
}

.filter-item .Select-control,
.filter-item input,
.filter-item select {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.95rem;
}

.refresh-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s;
}

.refresh-btn:hover {
    background: #5568d3;
}

/* Status Message */
.status-message {
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 4px;
    font-weight: 600;
}

.status-success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.status-error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

/* Metrics Grid */
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
}

.metric-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
}

.metric-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.metric-card h4 {
    color: #666;
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.metric-card p {
    font-size: 2rem;
    font-weight: bold;
    color: #667eea;
    margin: 0.5rem 0;
}

.metric-card small {
    font-size: 0.85rem;
    color: #999;
}

/* Charts */
.charts-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
}

.chart-container {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Data Table */
.data-section {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
}

.data-section h3 {
    margin-bottom: 1.5rem;
    color: #333;
}

.data-table-container {
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
}

.data-table thead {
    background-color: #f5f5f5;
    border-bottom: 2px solid #ddd;
}

.data-table th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #333;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 0.85rem;
}

.data-table td {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    color: #666;
}

.data-table tbody tr:hover {
    background-color: #f9f9f9;
}

.data-table tbody tr:nth-child(even) {
    background-color: #fafafa;
}

/* Footer */
.footer {
    background-color: #333;
    color: white;
    text-align: center;
    padding: 1.5rem;
    margin-top: auto;
}

.footer p {
    margin: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
    .charts-row {
        grid-template-columns: 1fr;
    }

    .metrics-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
    }
}

@media (max-width: 768px) {
    .header-content h1 {
        font-size: 1.5rem;
    }

    .main-container {
        padding: 1rem;
    }

    .filters-container {
        flex-direction: column;
        align-items: stretch;
    }

    .filter-item {
        width: 100%;
    }

    .metrics-grid {
        grid-template-columns: 1fr;
    }

    .metric-card p {
        font-size: 1.5rem;
    }

    .data-table {
        font-size: 0.8rem;
    }

    .data-table th,
    .data-table td {
        padding: 0.5rem;
    }

    .data-table th:nth-child(n+4),
    .data-table td:nth-child(n+4) {
        display: none;
    }
}
"""
