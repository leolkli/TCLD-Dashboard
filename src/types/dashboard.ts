/**
 * Dashboard Types — Revised Model
 *
 * Three dashboard scopes:
 *   1. portfolio-main  – one per portfolio, shown when portfolio is clicked
 *   2. building-main   – one per building, shown when building is clicked
 *   3. building-sub    – unlimited per building, listed below the building in sidebar
 *
 * Layout powered by react-grid-layout.
 */

import type { Layout } from 'react-grid-layout';

// ─── Dashboard Scope ───────────────────────────────────────────
export type DashboardScope = 'portfolio-main' | 'building-main' | 'building-sub';

// ─── Dashboard Definition ──────────────────────────────────────
export interface Dashboard {
  id: string;
  name: string;
  scope: DashboardScope;
  /** Set when scope = 'portfolio-main' */
  portfolioName?: string;
  /** Set when scope = 'building-main' | 'building-sub' */
  buildingCode?: string;
  buildingName?: string;
  /** react-grid-layout positions for each widget */
  layout: Layout[];
  /** Widget instances placed on this dashboard */
  widgets: DashboardWidgetInstance[];
  sortOrder: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Widget Instance on a Dashboard ────────────────────────────
export interface DashboardWidgetInstance {
  /** Unique ID within this dashboard layout (matches Layout.i) */
  layoutId: string;
  /** Reference to the saved widget's ID */
  widgetId: string;
  /** Snapshot of the widget name for display */
  widgetName: string;
}

// ─── Dashboard List Item (for sidebar / selectors) ─────────────
export interface DashboardListItem {
  id: string;
  name: string;
  scope: DashboardScope;
  portfolioName?: string;
  buildingCode?: string;
}

// ─── Default empty dashboard ───────────────────────────────────
export const createEmptyDashboard = (
  scope: DashboardScope,
  overrides: Partial<Dashboard> = {},
): Dashboard => ({
  id: `dash-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: 'Untitled Dashboard',
  scope,
  layout: [],
  widgets: [],
  sortOrder: 0,
  createdBy: 'admin',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

