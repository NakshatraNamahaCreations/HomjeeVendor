// MeasurementContext.js
import React, { createContext, useContext, useState } from 'react';

const MeasurementContext = createContext();

export const MeasurementProvider = ({ children }) => {
  const [measurements, setMeasurements] = useState([]); // Stores all rooms

  const addMeasurement = (roomType, data) => {
    setMeasurements(prev => {
      // Check if this room type already exists
      const existingIndex = prev.findIndex(item => item.roomType === roomType);

      if (existingIndex !== -1) {
        // Replace existing measurement for this room
        const updated = [...prev];
        updated[existingIndex] = { roomType, data };
        return updated;
      } else {
        // Add new measurement for this room
        return [...prev, { roomType, data }];
      }
    });
  };

  const clearMeasurements = () => {
    setMeasurements([]);
  };

  return (
    <MeasurementContext.Provider
      value={{ measurements, addMeasurement, clearMeasurements }}
    >
      {children}
    </MeasurementContext.Provider>
  );
};

export const useMeasurement = () => useContext(MeasurementContext);
