import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5eead4',
      contrastText: '#042f2e',
    },
    secondary: {
      main: '#94a3b8',
    },
    error: {
      main: '#fb7185',
    },
    background: {
      default: '#10141c',
      paper: '#181e29',
    },
    text: {
      primary: '#f4f7fb',
      secondary: '#9aa6b8',
    },
    divider: 'rgba(244, 247, 251, 0.08)',
  },
  typography: {
    fontFamily: '"DM Sans", "Segoe UI", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h1: { fontWeight: 650, letterSpacing: '-0.05em' },
    h3: { fontWeight: 650, letterSpacing: '-0.04em' },
    h4: { fontWeight: 600, letterSpacing: '-0.03em' },
    h6: { fontWeight: 650, letterSpacing: '-0.03em' },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#10141c',
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
          backgroundColor: 'rgba(255,255,255,0.03)',
        },
      },
    },
  },
});

export default theme;
