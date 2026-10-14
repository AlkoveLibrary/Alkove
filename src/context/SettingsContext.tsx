import React, { createContext, useContext, useEffect, useState } from "react";

type Settings = {
  theme: "light" | "dark";
};

const defaultSettings: Settings = {
  theme: "light",
};

const SETTINGS_KEY = "alkove_settings";

const SettingsContext = createContext<
  | {
      settings: Settings;
      setSettings: (settings: Settings) => void;
    }
  | undefined
>(undefined);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};

export const SettingsProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem(SETTINGS_KEY)
          : null;
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSettingsState({ ...defaultSettings, ...JSON.parse(stored) });
      }
    } catch {
      localStorage.removeItem(SETTINGS_KEY);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings, loaded]);

  const setSettings = (newSettings: Settings) => {
    setSettingsState(newSettings);
  };

  if (!loaded) return null;

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
