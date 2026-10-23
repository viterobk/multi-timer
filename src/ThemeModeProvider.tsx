import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from './theme';
import { applyThemeMode, readThemeMode, saveThemeMode, ThemeMode } from './themeMode';

type ThemeModeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

applyThemeMode(readThemeMode());

export const ThemeModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>(readThemeMode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const setMode = (next: ThemeMode) => {
    saveThemeMode(next);
    setModeState(next);
  };

  return (
    <ThemeModeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const value = useContext(ThemeModeContext);
  if (!value) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return value;
};
