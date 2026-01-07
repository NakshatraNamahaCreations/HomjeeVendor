import React, { createContext, useState, useContext } from 'react';

const LeadContext = createContext();

export const useLeadContext = () => useContext(LeadContext);

export const LeadProvider = ({ children }) => {
  const [leadDataContext, setLeadDataContext] = useState(null);
  const clearLeadContextData = () => {
    setLeadDataContext(null);
  };
  return (
    <LeadContext.Provider
      value={{
        leadDataContext,
        setLeadDataContext,
        clearLeadContextData,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};
