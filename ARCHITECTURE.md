# TCLD Energy Management Platform - Architecture Document

## Overview

The **TCLD Carbon Building Services Energy Management Platform (TCLD-CBSEMP)** is a web-based energy analytics and monitoring system designed to help organizations track, analyze, and optimize building energy consumption across a portfolio of 20+ buildings serving approximately 100 employees.

### Business Objectives
- Real-time monitoring of building energy consumption
- Performance tag (Ptag) and virtual tag (Vtag) management for energy metrics
- Dashboard customization for different user roles
- Building comparison and benchmarking
- Administrative controls for user and template management

---

## Technology Stack

### Frontend Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI component library with hooks-based architecture |
| **TypeScript** | 5.3.3 | Type-safe JavaScript for improved DX and maintainability |
| **Vite** | 5.4.21 | Fast build tool with HMR (Hot Module Replacement) |

### UI Components & Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| **Material UI (MUI)** | 5.15.10 | Pre-built component library following Material Design |
| **@mui/x-data-grid** | 6.19.5 | Advanced data table with sorting, filtering, pagination |
| **@emotion/react** | 11.11.3 | CSS-in-JS styling engine for MUI |

### Data Visualization (Hybrid Approach)
| Technology | Version | Purpose |
|------------|---------|---------|
| **Recharts** | 2.12.2 | Primary charting - line, bar, area, pie charts |
| **ECharts** | 5.5.0 | Complex visualizations - heatmaps, gauges, treemaps |
| **echarts-for-react** | 3.0.2 | React wrapper for ECharts |

### State Management
| Technology | Version | Purpose |
|------------|---------|---------|
| **Zustand** | 4.5.1 | Lightweight state management with minimal boilerplate |

### Authentication
| Technology | Version | Purpose |
|------------|---------|---------|
| **@azure/msal-browser** | 3.10.0 | Microsoft Authentication Library for browser |
| **@azure/msal-react** | 2.0.12 | React hooks and components for MSAL |

### Layout & Utilities
| Technology | Version | Purpose |
|------------|---------|---------|
| **react-router-dom** | 6.22.1 | Client-side routing with nested routes |
| **react-grid-layout** | 1.4.4 | Draggable/resizable dashboard widgets |
| **date-fns** | 3.3.1 | Date manipulation and formatting |
| **axios** | 1.6.7 | HTTP client for API communication |
| **uuid** | 9.0.1 | Unique identifier generation |

---

## Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Header    │  │   Sidebar   │  │  Main View  │  │  Modals     │    │
│  │  (TopNav)   │  │ (Navigation)│  │  (Routes)   │  │ (Dialogs)   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────────────────────┤
│                         REACT COMPONENT LAYER                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Pages: Dashboard | Buildings | Admin (Users/Templates/Vtags)   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Components: Charts | Cards | Tables | Forms | Layout           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────┤
│                         STATE MANAGEMENT (Zustand)                       │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │
│  │  authStore    │  │  buildingStore│  │  dashboardStore│              │
│  │  (User/Auth)  │  │  (Buildings)  │  │  (Widgets)    │               │
│  └───────────────┘  └───────────────┘  └───────────────┘               │
├─────────────────────────────────────────────────────────────────────────┤
│                         SERVICE LAYER                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  API Service (Axios) - Token injection, error handling            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│                         AUTHENTICATION (MSAL)                            │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Microsoft Entra ID (Azure AD) - OAuth 2.0 / OIDC                 │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (Future)                             │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  REST API Endpoints - /api/buildings, /api/energy, /api/vtags     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
App.tsx
├── Layout (MainLayout)
│   ├── Header
│   │   ├── Logo
│   │   ├── Search
│   │   ├── Notifications
│   │   └── UserMenu (Avatar, Logout)
│   ├── Sidebar
│   │   ├── Navigation Items
│   │   └── Role-based Access Control
│   └── Main Content Area
│       └── React Router Outlet
│           ├── DashboardPage
│           │   ├── EnergyOverviewCard
│           │   ├── BuildingSummaryCard
│           │   └── Chart Widgets (Recharts/ECharts)
│           ├── BuildingsPage
│           │   └── BuildingDetailPage
│           └── Admin Pages
│               ├── UserManagementPage
│               ├── DashboardTemplatesPage
│               └── VtagManagementPage
```

---

## Directory Structure

```
public/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── charts/          # Chart components (Recharts + ECharts)
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   ├── AreaChart.tsx
│   │   │   ├── GaugeChart.tsx      # ECharts
│   │   │   ├── HeatmapChart.tsx    # ECharts
│   │   │   └── TreemapChart.tsx    # ECharts
│   │   ├── common/          # Shared components
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   └── layout/          # Layout components
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── MainLayout.tsx
│   │
│   ├── pages/               # Route-level page components
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── buildings/
│   │   │   ├── BuildingsPage.tsx
│   │   │   └── BuildingDetailPage.tsx
│   │   └── admin/
│   │       ├── UserManagementPage.tsx
│   │       ├── DashboardTemplatesPage.tsx
│   │       └── VtagManagementPage.tsx
│   │
│   ├── services/            # API and external service integrations
│   │   └── api.ts           # Axios instance with MSAL token injection
│   │
│   ├── store/               # Zustand state stores
│   │   ├── authStore.ts     # Authentication state
│   │   ├── buildingStore.ts # Building data state
│   │   └── dashboardStore.ts # Dashboard widget state
│   │
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Shared interfaces and types
│   │
│   ├── config/              # Configuration files
│   │   └── authConfig.ts    # MSAL configuration
│   │
│   ├── App.tsx              # Root component with routing
│   ├── main.tsx             # Application entry point
│   └── theme.ts             # MUI theme customization
│
├── .env.local               # Environment variables (not committed)
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
└── ARCHITECTURE.md          # This document
```

---

## Data Models

### Core Types (src/types/index.ts)

```typescript
// User and Authentication
interface User {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  assignedBuildings: string[];
}

type UserRole = 'admin' | 'manager' | 'viewer';

// Building and Energy Data
interface Building {
  id: string;
  name: string;
  address: string;
  floors: number;
  totalArea: number;        // square meters
  energyRating: string;     // A-G rating
  managerId: string;
}

interface EnergyReading {
  buildingId: string;
  timestamp: Date;
  consumption: number;      // kWh
  cost: number;             // currency
  source: 'electricity' | 'gas' | 'solar' | 'other';
}

// Virtual Tags (Calculated Metrics)
interface VirtualTag {
  id: string;
  name: string;
  description: string;
  formula: string;          // e.g., "consumption / area"
  unit: string;
  category: string;
}

// Dashboard Configuration
interface DashboardWidget {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'gauge' | 'heatmap' | 'kpi';
  title: string;
  dataSource: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
}

interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdBy: string;
}
```

---

## Authentication Flow

### Microsoft Entra ID (Azure AD) Integration

```
┌─────────┐     ┌─────────────┐     ┌──────────────────┐
│  User   │────▶│   React App │────▶│  Microsoft Entra │
│         │     │   (MSAL)    │     │   ID (Azure AD)  │
└─────────┘     └─────────────┘     └──────────────────┘
     │                │                      │
     │                │  1. Redirect to      │
     │                │     login page       │
     │                │─────────────────────▶│
     │                │                      │
     │◀───────────────│  2. User enters      │
     │   Login UI     │     credentials      │
     │───────────────▶│                      │
     │                │                      │
     │                │◀─────────────────────│
     │                │  3. Return tokens    │
     │                │     (ID + Access)    │
     │                │                      │
     │                │  4. Store tokens     │
     │                │     in sessionStorage│
     │                │                      │
     │                │  5. API calls with   │
     │                │     Bearer token     │
     │                │─────────────────────▶│  Backend API
```

### MSAL Configuration

```typescript
// Environment Variables (.env.local)
VITE_AZURE_CLIENT_ID=089bfdc6-4a5d-4782-9915-aa338a447d92
VITE_AZURE_TENANT_ID=ae326a90-5548-4db0-a52c-9b8e317c2010
VITE_AZURE_REDIRECT_URI=http://localhost:3000
VITE_API_BASE_URL=https://api.tcld-energy.com

// Authentication Scopes
- openid (user identity)
- profile (user profile info)
- email (user email)
- User.Read (Microsoft Graph - user details)
- api://{client-id}/access (Custom API scope)
```

---

## State Management (Zustand)

### Store Architecture

```typescript
// authStore.ts - Authentication State
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// buildingStore.ts - Building Data State
interface BuildingState {
  buildings: Building[];
  selectedBuilding: Building | null;
  isLoading: boolean;
  error: string | null;
  fetchBuildings: () => Promise<void>;
  selectBuilding: (id: string) => void;
}

// dashboardStore.ts - Dashboard Configuration State
interface DashboardState {
  widgets: DashboardWidget[];
  templates: DashboardTemplate[];
  activeTemplate: string | null;
  addWidget: (widget: DashboardWidget) => void;
  removeWidget: (id: string) => void;
  updateWidgetPosition: (id: string, position: Position) => void;
  loadTemplate: (templateId: string) => void;
}
```

### Usage Pattern

```typescript
// In components
import { useAuthStore } from '@store/authStore';
import { useBuildingStore } from '@store/buildingStore';

function MyComponent() {
  const { user, isAuthenticated } = useAuthStore();
  const { buildings, fetchBuildings } = useBuildingStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchBuildings();
    }
  }, [isAuthenticated]);
}
```

---

## API Integration

### Service Layer Pattern

```typescript
// services/api.ts
import axios from 'axios';
import { msalInstance } from '@/config/authConfig';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request interceptor - inject Bearer token
api.interceptors.request.use(async (config) => {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    const response = await msalInstance.acquireTokenSilent({
      account: accounts[0],
      scopes: ['api://.../.default'],
    });
    config.headers.Authorization = `Bearer ${response.accessToken}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      msalInstance.loginRedirect();
    }
    return Promise.reject(error);
  }
);
```

### Expected API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/buildings` | List all buildings |
| GET | `/api/buildings/:id` | Get building details |
| GET | `/api/buildings/:id/energy` | Get energy readings |
| GET | `/api/vtags` | List virtual tags |
| POST | `/api/vtags` | Create virtual tag |
| PUT | `/api/vtags/:id` | Update virtual tag |
| DELETE | `/api/vtags/:id` | Delete virtual tag |
| GET | `/api/templates` | List dashboard templates |
| POST | `/api/templates` | Create dashboard template |
| GET | `/api/users` | List users (admin only) |
| PUT | `/api/users/:id/roles` | Update user roles |

---

## Role-Based Access Control (RBAC)

### Role Definitions

| Role | Permissions |
|------|-------------|
| **admin** | Full access: manage users, templates, vtags, all buildings |
| **manager** | View all buildings, create/edit own templates, view users |
| **viewer** | View assigned buildings only, use templates |

### Route Protection

```typescript
// Protected routes based on role
const routes = [
  { path: '/dashboard', roles: ['admin', 'manager', 'viewer'] },
  { path: '/buildings', roles: ['admin', 'manager', 'viewer'] },
  { path: '/admin/users', roles: ['admin'] },
  { path: '/admin/templates', roles: ['admin', 'manager'] },
  { path: '/admin/vtags', roles: ['admin'] },
  { path: '/settings', roles: ['admin', 'manager', 'viewer'] },
];
```

---

## Charting Strategy

### Technology Selection by Chart Type

| Chart Type | Library | Reason |
|------------|---------|--------|
| Line Chart | Recharts | Simple time-series, good animations |
| Bar Chart | Recharts | Comparisons, easy customization |
| Pie/Donut | Recharts | Distribution visualization |
| Area Chart | Recharts | Cumulative data over time |
| **Gauge** | ECharts | Complex meter visualizations |
| **Heatmap** | ECharts | Time-based patterns (24h x 7d) |
| **Treemap** | ECharts | Hierarchical data visualization |
| **Sankey** | ECharts | Energy flow visualization |

### Chart Component Pattern

```typescript
// components/charts/LineChart.tsx
interface LineChartProps {
  data: Array<{ timestamp: string; value: number }>;
  title?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  animate?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  color = '#667eea',
  height = 300,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke={color} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};
```

---

## Theme Configuration

### Color Palette

```typescript
// theme.ts
const palette = {
  primary: {
    main: '#667eea',      // Purple-blue
    light: '#8b9cf7',
    dark: '#4a5fd9',
  },
  secondary: {
    main: '#764ba2',      // Purple
    light: '#9b6fc2',
    dark: '#5a3580',
  },
  success: '#4caf50',     // Green - good energy performance
  warning: '#ff9800',     // Orange - attention needed
  error: '#f44336',       // Red - critical alerts
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
};
```

### Typography

```typescript
const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
  h1: { fontWeight: 700, fontSize: '2.5rem' },
  h2: { fontWeight: 600, fontSize: '2rem' },
  h3: { fontWeight: 600, fontSize: '1.5rem' },
  body1: { fontSize: '1rem', lineHeight: 1.6 },
};
```

---

## Development Guidelines

### Code Conventions

1. **File Naming**: PascalCase for components (`DashboardPage.tsx`), camelCase for utilities (`formatDate.ts`)
2. **Component Structure**: Functional components with hooks only
3. **State**: Use Zustand stores for global state, `useState` for local component state
4. **Types**: Define interfaces in `types/index.ts`, export and import explicitly
5. **Imports**: Use path aliases (`@components`, `@pages`, `@store`, etc.)

### Path Aliases (tsconfig.json)

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@components/*": ["./src/components/*"],
    "@pages/*": ["./src/pages/*"],
    "@store/*": ["./src/store/*"],
    "@services/*": ["./src/services/*"],
    "@types/*": ["./src/types/*"],
    "@config/*": ["./src/config/*"]
  }
}
```

### Available Scripts

```bash
npm run dev      # Start development server (Vite)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run format   # Run Prettier
```

---

## Deployment Considerations

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_AZURE_CLIENT_ID` | Azure AD App Registration Client ID | `089bfdc6-...` |
| `VITE_AZURE_TENANT_ID` | Azure AD Tenant ID | `ae326a90-...` |
| `VITE_AZURE_REDIRECT_URI` | OAuth redirect URI | `https://app.tcld.com` |
| `VITE_API_BASE_URL` | Backend API base URL | `https://api.tcld.com` |

### Build Output

- Static files output to `dist/` directory
- Can be served by any static file server (Azure Static Web Apps, S3, Nginx)
- SPA routing requires server-side redirect rules (all routes → index.html)

---

## Future Enhancements

1. **Real-time Data**: WebSocket integration for live energy readings
2. **Offline Support**: Service Worker for PWA capabilities
3. **Export Features**: PDF/Excel report generation
4. **Notifications**: Push notifications for alerts
5. **Mobile App**: React Native or PWA optimizations
6. **AI Insights**: Anomaly detection and energy consumption predictions

---

## Contact & Resources

- **Project**: TCLD Carbon Building Services Energy Management Platform
- **Target Users**: ~100 employees across 20 buildings
- **Timeline**: Quick MVP (1-2 months)
- **Repository**: TCLD-CBSEMP

---

*Last Updated: March 2026*
