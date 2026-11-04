import { createContext, useContext } from 'react';

export const AlertContext = createContext(null);

export const useAlert = () => useContext(AlertContext);
