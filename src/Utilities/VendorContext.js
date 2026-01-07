import React, { createContext, useState, useContext } from 'react';

const VendorContext = createContext();

export const useVendorContext = () => useContext(VendorContext);

export const VendorProvider = ({ children }) => {
  const [vendorDataContext, setVendorDataContext] = useState(null);
  const clearVendorContextData = () => {
    setVendorDataContext(null);
  };
  return (
    <VendorContext.Provider
      value={{
        vendorDataContext,
        setVendorDataContext,
        clearVendorContextData,
      }}
    >
      {children}
    </VendorContext.Provider>
  );
};
