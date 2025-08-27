import React, { createContext, useContext } from 'react';

// Criação do contexto
export const MainContext = createContext();

// Hook personalizado para facilitar o uso do contexto
export const useMainContext = () => {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error('useMainContext deve ser usado dentro de um MainContextProvider');
  }
  return context;
};