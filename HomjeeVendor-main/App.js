import React, { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import MyStack from './MyStack';
import { VendorProvider } from './src/Utilities/VendorContext';
import { LeadProvider } from './src/Utilities/LeadContext';
import NoInternet from './src/Utilities/NoInternet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/Utilities/ThemeContext';
import { MeasurementProvider } from './src/Utilities/MeasurementContext';
import { EstimateProvider } from './src/Utilities/EstimateContext';
import { RoomNameProvider } from './src/Utilities/RoomContext';
import { PerformanceProvider } from './src/Utilities/PerformanceContext';
import { setupNotificationListeners } from './src/Utilities/notifications';

function App() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // Push notifications (#3): create the sound channel + foreground/token
  // listeners once on app start. Token registration happens after login.
  useEffect(() => {
    const unsub = setupNotificationListeners();
    return () => unsub && unsub();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <VendorProvider>
          <PerformanceProvider>
            <EstimateProvider>
              <LeadProvider>
                <MeasurementProvider>
                  <RoomNameProvider>
                    {isConnected ? <MyStack /> : <NoInternet />}
                  </RoomNameProvider>
                </MeasurementProvider>
              </LeadProvider>
            </EstimateProvider>
          </PerformanceProvider>
        </VendorProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default App;
