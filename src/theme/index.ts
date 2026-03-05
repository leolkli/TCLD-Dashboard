import { createTheme, alpha, ThemeOptions } from '@mui/material/styles';

// --- Modern Bento Grid Palette (Clean, Tech-Focused) ---
const colors = {
  primary: {
    main: '#4F46E5', // Indigo 600 - Modern tech blue
    light: '#818CF8', // Indigo 400
    dark: '#3730A3', // Indigo 800
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#10B981', // Emerald 500 - Energy efficient green
    light: '#34D399', // Emerald 400
    dark: '#059669', // Emerald 600
    contrastText: '#ffffff',
  },
  accent: {
    main: '#F59E0B', // Amber 500 - Warning/Attention
    light: '#FBBF24',
    dark: '#D97706',
  },
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
  },
  info: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
  },
  grey: {
    50: '#F9FAFB', // Background
    100: '#F3F4F6', // Surface variants
    200: '#E5E7EB', // Borders
    300: '#D1D5DB', // Disabled
    400: '#9CA3AF', // Icons/Subtext
    500: '#6B7280', // Body text secondary
    600: '#4B5563', // Body text
    700: '#374151', // Headings
    800: '#1F2937', // Heavy text
    900: '#111827', // Black text
  },
};

// --- Chart Colors (Bento Style) ---
export const chartColors = {
  primary: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  energy: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
  heatmap: {
    low: '#10B981',    // Green (Efficient)
    medium: '#F59E0B', // Amber (Watch)
    high: '#EF4444',   // Red (Alert)
  },
  comparison: ['#4F46E5', '#9CA3AF'], // Primary vs Grey (Baseline)
};

// --- Custom Shadows (Soft, expansive) ---
const shadows: ThemeOptions['shadows'] = [
  'none',
  '0px 1px 2px rgba(0, 0, 0, 0.05)', // Minimal (1)
  '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)', // Small (2)
  '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)', // Medium (3) - Default Card
  '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)', // Large (4) - Hover
  '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)', // XL (5) - Modal
  ...Array(19).fill('none'), // Fill standard MUI shadows
] as any;

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    grey: colors.grey,
    background: {
      default: '#F3F4F6', // Light gray background for contrast
      paper: '#FFFFFF',   // Pure white cards
    },
    text: {
      primary: colors.grey[900], // High contrast
      secondary: colors.grey[500], // Softer secondary
    },
    divider: colors.grey[200],
  },
  shape: {
    borderRadius: 16, // Modern rounded corners (Bento style)
  },
  shadows: shadows,
  typography: {
    fontFamily: '"Onest", "Inter", "Roboto", "Helvetica", "Arial", sans-serif', // Modern geometric sans
    h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, color: colors.grey[900] },
    h2: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.3, color: colors.grey[900] },
    h3: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.4, color: colors.grey[800] },
    h4: { fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.5, color: colors.grey[800] },
    h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.5, color: colors.grey[800] },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5, color: colors.grey[800] },
    subtitle1: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5, color: colors.grey[700] },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.57, color: colors.grey[600] },
    body1: { fontSize: '1rem', lineHeight: 1.6, color: colors.grey[600] },
    body2: { fontSize: '0.875rem', lineHeight: 1.6, color: colors.grey[500] },
    button: { textTransform: 'none', fontWeight: 600 }, // No uppercase buttons
    caption: { fontSize: '0.75rem', lineHeight: 1.66, color: colors.grey[400] },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        /* Removed @import - added to index.html to avoid CSS precedence errors */
        body {
          background-color: #F3F4F6;
          color: #111827;
        }
        /* Modern Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1; 
        }
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1; 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8; 
        }
      `,
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.05), 0px 2px 4px -1px rgba(0, 0, 0, 0.03)', // Soft default shadow
          border: '1px solid #E5E7EB', // Subtle border definition
          '&:hover': {
            boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.08), 0px 4px 6px -2px rgba(0, 0, 0, 0.04)', // Lift on hover
            borderColor: '#D1D5DB',
            transform: 'translateY(-2px)', // Micro-interaction lift
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove dark mode gradient if used later
        },
        rounded: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10, // slightly less rounded than cards for distinct shape
          textTransform: 'none',
          boxShadow: 'none',
          fontWeight: 600,
          padding: '8px 20px',
          '&:hover': {
            boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
        containedPrimary: {
          backgroundColor: colors.primary.main,
          '&:hover': {
            backgroundColor: colors.primary.dark,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Modern pill/rect shape (less rounded than full pill)
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          '& fieldset': {
            borderColor: colors.grey[300],
          },
          '&:hover fieldset': {
            borderColor: colors.grey[400],
          },
          '&.Mui-focused fieldset': {
            borderWidth: '2px', // Chunky focus border
            borderColor: colors.primary.main,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20, // More rounded modals
          boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Frost/Glassmorphism effect
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${colors.grey[200]}`,
          boxShadow: 'none',
          color: colors.grey[900],
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF', // Sidebar white
          borderRight: `1px solid ${colors.grey[200]}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10, // Rounded active states in sidebar
          margin: '4px 8px', // Float items off edge
          '&.Mui-selected': {
            backgroundColor: alpha(colors.primary.main, 0.1),
            color: colors.primary.main,
            '&:hover': {
              backgroundColor: alpha(colors.primary.main, 0.15),
            },
            '& .MuiListItemIcon-root': {
              color: colors.primary.main,
            },
          },
          '&:hover': {
            backgroundColor: colors.grey[50],
          },
        },
      },
    },
  },
});

export default theme;
