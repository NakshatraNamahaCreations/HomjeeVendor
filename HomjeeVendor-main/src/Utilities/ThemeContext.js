import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';

const ThemeColor = createContext();

export const useThemeColor = () => useContext(ThemeColor);

export const ThemeProvider = ({ children }) => {
  const [deviceTheme, setDeviceTheme] = useState(null);

  useEffect(() => {
    const colorScheme = Appearance.getColorScheme();
    setDeviceTheme(colorScheme);

    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setDeviceTheme(colorScheme);
    });
    return () => listener.remove();
  }, []);

  // console.log('deviceTheme', deviceTheme);

  return (
    <ThemeColor.Provider
      value={{
        deviceTheme,
        setDeviceTheme,
      }}
    >
      {children}
    </ThemeColor.Provider>
  );
};
