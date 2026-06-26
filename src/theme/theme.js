import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#c62828',
      dark: '#8e1717',
      light: '#ef5350',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#4b5563',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f6f6f4',
      paper: '#ffffff'
    },
    text: {
      primary: '#202124',
      secondary: '#60646c'
    },
    divider: '#dedede'
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
    button: {
      fontWeight: 700,
      textTransform: 'none'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          boxShadow: 'none'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        size: 'medium'
      }
    }
  }
});

export default theme;
