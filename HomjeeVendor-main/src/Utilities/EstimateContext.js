import React, { createContext, useState, useContext } from 'react';

const EstimateContext = createContext();

export const useEstimateContext = () => useContext(EstimateContext);

export const EstimateProvider = ({ children }) => {
  const [estimateData, setEstimateData] = useState(null);
  const clearEstimateDataData = () => {
    setEstimateData(null);
  };
  return (
    <EstimateContext.Provider
      value={[estimateData, setEstimateData, clearEstimateDataData]}
    >
      {children}
    </EstimateContext.Provider>
  );
};
