export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'multi-timer-theme';

export const THEME_META_COLOR: Record<ThemeMode, string> = {
  dark: '#10141c',
  light: '#f3f6fa',
};

export const readThemeMode = (): ThemeMode => {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === 'light' || value === 'dark') {
      return value;
    }
  } catch {
    // ignore storage errors
  }
  return 'dark';
};

export const applyThemeMode = (mode: ThemeMode) => {
  const root = document.documentElement;
  root.setAttribute('data-theme', mode);
  root.style.colorScheme = mode;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', THEME_META_COLOR[mode]);
  }
};

export const saveThemeMode = (mode: ThemeMode) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // ignore storage errors
  }
  applyThemeMode(mode);
};
