import { createTheme } from '@mui/material/styles';
import { ThemeMode } from './themeMode';

const sharedTypography = {
  fontFamily: '"DM Sans", "Segoe UI", sans-serif',
  button: {
    textTransform: 'none' as const,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  h1: { fontWeight: 650, letterSpacing: '-0.05em' },
  h3: { fontWeight: 650, letterSpacing: '-0.04em' },
  h4: { fontWeight: 600, letterSpacing: '-0.03em' },
  h6: { fontWeight: 650, letterSpacing: '-0.03em' },
};

export const createAppTheme = (mode: ThemeMode) => {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: isLight
        ? { main: '#0d9488', contrastText: '#ffffff' }
        : { main: '#5eead4', contrastText: '#042f2e' },
      secondary: {
        main: isLight ? '#64748b' : '#94a3b8',
      },
      error: {
        main: isLight ? '#e11d48' : '#fb7185',
      },
      background: {
        default: isLight ? '#f3f6fa' : '#10141c',
        paper: isLight ? '#ffffff' : '#181e29',
      },
      text: {
        primary: isLight ? '#152033' : '#f4f7fb',
        secondary: isLight ? '#5b6b80' : '#9aa6b8',
      },
      divider: isLight ? 'rgba(21, 32, 51, 0.1)' : 'rgba(244, 247, 251, 0.08)',
    },
    typography: sharedTypography,
    shape: {
      borderRadius: 18,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isLight ? '#f3f6fa' : '#10141c',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            padding: '10px 16px',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: isLight ? 'rgba(15, 23, 42, 0.03)' : 'rgba(255,255,255,0.03)',
          },
        },
      },
    },
  });
};

export default createAppTheme('dark');
