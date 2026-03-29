import React, { createContext, useContext, useState, useEffect } from 'react';

const ModeContext = createContext();

export const ModeProvider = ({ children }) => {
  const [mode, setMode] = useState('Patient'); // 'Patient' or 'Caregiver'

  const toggleMode = () => {
    setMode((prev) => (prev === 'Patient' ? 'Caregiver' : 'Patient'));
  };

  return (
    <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = () => useContext(ModeContext);
