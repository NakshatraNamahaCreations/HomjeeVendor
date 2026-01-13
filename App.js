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

function App() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <VendorProvider>
          <EstimateProvider>
            <LeadProvider>
              <MeasurementProvider>
                <RoomNameProvider>
                  <PerformanceProvider>
                    {isConnected ? <MyStack /> : <NoInternet />}
                  </PerformanceProvider>
                </RoomNameProvider>
              </MeasurementProvider>
            </LeadProvider>
          </EstimateProvider>
        </VendorProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default App;
