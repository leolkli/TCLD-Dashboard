"""
TCLD EA Ptag Dashboard - Dash Application
Energy Analytics Performance Tag Monitoring System
"""

import dash
from dash import dcc, html, callback
from dash.dependencies import Input, Output, State
import plotly.graph_objs as go
import plotly.express as px
import pandas as pd
from datetime import datetime, timedelta
import logging

from database import (
    get_eaptag_data,
    get_buildings,
    get_areas,
    get_dashboard_metrics,
    test_connection,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Dash app
app = dash.Dash(__name__)
app.title = "TCLD EA Ptag Dashboard"

# Define app layout
app.layout = html.Div(
    [
        # Header
        html.Div(
            [
                html.Div(
                    [
                        html.H1("TCLD - EA Ptag Dashboard"),
                        html.P("Energy Analytics Performance Tag Monitoring System"),
                    ],
                    className="header-content",
                )
            ],
            className="header",
        ),
        # Main Container
        html.Div(
            [
                # Navigation/Filters Section
                html.Div(
                    [
                        html.Div(
                            [
                                html.Label("Select Building:"),
                                dcc.Dropdown(
                                    id="building-dropdown",
                                    placeholder="-- Select Building --",
                                    searchable=True,
                                    clearable=True,
                                ),
                            ],
                            className="filter-item",
                        ),
                        html.Div(
                            [
                                html.Label("Select Area:"),
                                dcc.Dropdown(
                                    id="area-dropdown",
                                    placeholder="-- Select Area --",
                                    searchable=True,
                                    clearable=True,
                                ),
                            ],
                            className="filter-item",
                        ),
                        html.Div(
                            [
                                html.Label("Date Range:"),
                                dcc.DatePickerRange(
                                    id="date-range",
                                    start_date=datetime.now() - timedelta(days=30),
                                    end_date=datetime.now(),
                                    display_format="YYYY-MM-DD",
                                ),
                            ],
                            className="filter-item",
                        ),
                        html.Button(
                            "Refresh Data",
                            id="refresh-button",
                            n_clicks=0,
                            className="refresh-btn",
                        ),
                    ],
                    className="filters-container",
                ),
                # Status Message
                html.Div(id="connection-status", className="status-message"),
                # Metrics Cards
                html.Div(id="metrics-cards", className="metrics-grid"),
                # Charts Section
                html.Div(
                    [
                        html.Div(
                            [dcc.Graph(id="consumption-chart")],
                            className="chart-container",
                        ),
                        html.Div(
                            [dcc.Graph(id="distribution-chart")],
                            className="chart-container",
                        ),
                    ],
                    className="charts-row",
                ),
                # Data Table Section
                html.Div(
                    [
                        html.H3("Recent Data"),
                        html.Div(id="data-table", className="data-table-container"),
                    ],
                    className="data-section",
                ),
            ],
            className="main-container",
        ),
        # Footer
        html.Div(
            html.P("© 2026 TCLD Technical Cloud. All rights reserved."),
            className="footer",
        ),
    ],
    className="app-wrapper",
)


# Callbacks
@app.callback(
    Output("building-dropdown", "options"),
    Input("refresh-button", "n_clicks"),
    prevent_initial_call=False,
)
def populate_buildings(n_clicks):
    """Load buildings on app start and refresh"""
    try:
        buildings = get_buildings()
        if buildings is not None:
            return [
                {"label": b["buildingName"], "value": b["buildingId"]}
                for b in buildings
            ]
        return []
    except Exception as e:
        logger.error(f"Error loading buildings: {e}")
        return []


@app.callback(
    Output("area-dropdown", "options"),
    Input("building-dropdown", "value"),
)
def populate_areas(selected_building):
    """Load areas based on selected building"""
    if not selected_building:
        return []

    try:
        areas = get_areas(selected_building)
        if areas is not None:
            return [{"label": a["areaName"], "value": a["areaId"]} for a in areas]
        return []
    except Exception as e:
        logger.error(f"Error loading areas: {e}")
        return []


@app.callback(
    Output("connection-status", "children"),
    Input("refresh-button", "n_clicks"),
    prevent_initial_call=False,
)
def check_connection(n_clicks):
    """Check database connection status"""
    try:
        connected = test_connection()
        if connected:
            return html.Div(
                "✓ Database Connected",
                className="status-success",
            )
        else:
            return html.Div(
                "✗ Database Connection Failed",
                className="status-error",
            )
    except Exception as e:
        return html.Div(
            f"✗ Error: {str(e)[:50]}",
            className="status-error",
        )


@app.callback(
    Output("metrics-cards", "children"),
    Input("refresh-button", "n_clicks"),
    State("building-dropdown", "value"),
    State("date-range", "start_date"),
    State("date-range", "end_date"),
    prevent_initial_call=False,
)
def update_metrics(n_clicks, building_id, start_date, end_date):
    """Update metrics cards"""
    try:
        metrics = get_dashboard_metrics(building_id, start_date, end_date)

        if metrics is None:
            return html.Div("No data available")

        return [
            html.Div(
                [
                    html.H4("Total Energy Consumption"),
                    html.P(f"{metrics.get('totalEnergyConsumption', 0):.2f}"),
                    html.Small(f"{metrics.get('recordCount', 0)} records"),
                ],
                className="metric-card",
            ),
            html.Div(
                [
                    html.H4("Average Consumption"),
                    html.P(f"{metrics.get('averageConsumption', 0):.2f}"),
                ],
                className="metric-card",
            ),
            html.Div(
                [
                    html.H4("Peak Consumption"),
                    html.P(f"{metrics.get('peakConsumption', 0):.2f}"),
                ],
                className="metric-card",
            ),
            html.Div(
                [
                    html.H4("Lowest Consumption"),
                    html.P(f"{metrics.get('lowestConsumption', 0):.2f}"),
                ],
                className="metric-card",
            ),
        ]
    except Exception as e:
        logger.error(f"Error updating metrics: {e}")
        return html.Div(f"Error loading metrics: {str(e)[:100]}")


@app.callback(
    Output("consumption-chart", "figure"),
    Input("refresh-button", "n_clicks"),
    State("building-dropdown", "value"),
    State("area-dropdown", "value"),
    State("date-range", "start_date"),
    State("date-range", "end_date"),
    prevent_initial_call=False,
)
def update_consumption_chart(n_clicks, building_id, area_id, start_date, end_date):
    """Update consumption over time chart"""
    try:
        data = get_eaptag_data(building_id, area_id, start_date, end_date, limit=500)

        if data is None or len(data) == 0:
            return {
                "data": [],
                "layout": go.Layout(title="No data available"),
            }

        df = pd.DataFrame(data)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df = df.sort_values("timestamp")

        fig = px.line(
            df,
            x="timestamp",
            y="value",
            color="buildingName",
            title="Energy Consumption Over Time",
            labels={"timestamp": "Date", "value": "Consumption (kWh)"},
        )

        fig.update_layout(
            hovermode="x unified",
            plot_bgcolor="#f8f9fa",
            height=400,
        )

        return fig
    except Exception as e:
        logger.error(f"Error updating consumption chart: {e}")
        return {
            "data": [],
            "layout": go.Layout(title=f"Error: {str(e)[:50]}"),
        }


@app.callback(
    Output("distribution-chart", "figure"),
    Input("refresh-button", "n_clicks"),
    State("building-dropdown", "value"),
    State("area-dropdown", "value"),
    State("date-range", "start_date"),
    State("date-range", "end_date"),
    prevent_initial_call=False,
)
def update_distribution_chart(n_clicks, building_id, area_id, start_date, end_date):
    """Update consumption distribution chart"""
    try:
        data = get_eaptag_data(building_id, area_id, start_date, end_date, limit=500)

        if data is None or len(data) == 0:
            return {
                "data": [],
                "layout": go.Layout(title="No data available"),
            }

        df = pd.DataFrame(data)

        fig = px.box(
            df,
            x="buildingName",
            y="value",
            title="Consumption Distribution by Building",
            labels={"value": "Consumption (kWh)"},
        )

        fig.update_layout(
            plot_bgcolor="#f8f9fa",
            height=400,
        )

        return fig
    except Exception as e:
        logger.error(f"Error updating distribution chart: {e}")
        return {
            "data": [],
            "layout": go.Layout(title=f"Error: {str(e)[:50]}"),
        }


@app.callback(
    Output("data-table", "children"),
    Input("refresh-button", "n_clicks"),
    State("building-dropdown", "value"),
    State("area-dropdown", "value"),
    State("date-range", "start_date"),
    State("date-range", "end_date"),
    prevent_initial_call=False,
)
def update_data_table(n_clicks, building_id, area_id, start_date, end_date):
    """Update data table with recent records"""
    try:
        data = get_eaptag_data(building_id, area_id, start_date, end_date, limit=100)

        if data is None or len(data) == 0:
            return html.Div("No data available")

        df = pd.DataFrame(data)
        df["timestamp"] = pd.to_datetime(df["timestamp"]).dt.strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        # Create HTML table
        table = html.Table(
            [
                html.Thead(
                    html.Tr(
                        [
                            html.Th("Building"),
                            html.Th("Area"),
                            html.Th("Ptag"),
                            html.Th("Value"),
                            html.Th("Unit"),
                            html.Th("Timestamp"),
                        ]
                    )
                ),
                html.Tbody(
                    [
                        html.Tr(
                            [
                                html.Td(row.get("buildingName", "")),
                                html.Td(row.get("areaName", "")),
                                html.Td(row.get("ptagName", "")),
                                html.Td(f"{row.get('value', 0):.2f}"),
                                html.Td(row.get("unit", "")),
                                html.Td(row.get("timestamp", "")),
                            ]
                        )
                        for _, row in df.iterrows()
                    ]
                ),
            ],
            className="data-table",
        )

        return table
    except Exception as e:
        logger.error(f"Error updating data table: {e}")
        return html.Div(f"Error loading data: {str(e)[:100]}")


if __name__ == "__main__":
    print("Starting TCLD EA Ptag Dashboard...")
    print("Visit: http://localhost:8050")
    app.run(debug=True, host="0.0.0.0", port=8050)


# Export server for gunicorn
server = app.server
