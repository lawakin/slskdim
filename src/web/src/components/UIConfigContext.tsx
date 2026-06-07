// eslint-disable-next-line canonical/filename-match-regex
import {
  getConfig,
  setConfig as persistConfig,
  type UIConfig,
} from '../lib/uiConfig';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type UIConfigContextValue = [UIConfig, (updates: Partial<UIConfig>) => void];

const UIConfigContext = createContext<UIConfigContextValue | undefined>(
  undefined,
);

export const UIConfigProvider = ({
  children,
}: {
  readonly children: React.ReactNode;
}) => {
  const [storedConfig, setStoredConfig] = useState<UIConfig>(getConfig);

  const setConfig = useCallback((updates: Partial<UIConfig>) => {
    setStoredConfig(persistConfig(updates));
  }, []);

  const contextValue = useMemo<UIConfigContextValue>(
    () => [storedConfig, setConfig],
    [setConfig, storedConfig],
  );

  useEffect(() => {
    const element = document.documentElement;
    element.style.setProperty('--slskdim-text-color', storedConfig.text_color);
    element.style.setProperty(
      '--slskdim-primary-background',
      storedConfig.background_color,
    );
    element.style.setProperty(
      '--slskdim-secondary-background',
      storedConfig.secondary_background_color,
    );
    element.style.setProperty(
      '--slskdim-muted-background',
      storedConfig.muted_background_color,
    );
    element.style.setProperty(
      '--slskdim-secondary-background',
      storedConfig.secondary_background_color,
    );
    element.style.setProperty(
      '--slskdim-primary-color',
      storedConfig.primary_color,
    );
    element.style.setProperty(
      '--slskdim-primary-foreground',
      storedConfig.primary_foreground_color,
    );
    element.style.setProperty(
      '--slskdim-muted-foreground',
      storedConfig.muted_foreground_color,
    );
    element.style.setProperty('--slskdim-border', storedConfig.border_color);
    element.style.setProperty('--slskdim-ring', storedConfig.ring_color);
    element.style.setProperty(
      '--slskdim-destructive',
      storedConfig.destructive_color,
    );
    element.style.setProperty(
      '--slskdim-nav-background',
      storedConfig.sidebar.background_color,
    );
  }, [storedConfig]);

  return (
    <UIConfigContext.Provider value={contextValue}>
      {children}
    </UIConfigContext.Provider>
  );
};

export const useUIConfig = (): UIConfigContextValue => {
  const context = useContext(UIConfigContext);
  if (!context)
    throw new Error('useUIConfig must be used within UIConfigProvider');
  return context;
};

export default UIConfigContext;
