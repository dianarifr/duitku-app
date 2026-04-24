import { createContext, useContext, useState } from 'react';
import Alert from '../components/Alert';

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);

  const showAlert = (title, message, type = 'success', onConfirmExtra = null) => {
    setAlert({ title, message, type, onConfirmExtra });
  };

  const hideAlert = () => {
    if (alert?.onConfirmExtra) {
      alert.onConfirmExtra(); // Jalankan fungsi tambahan kalau ada (misal: pindah halaman)
    }
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {/* RENDER ALERT DI SINI (GLOBAL) */}
      {alert && (
        <Alert
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onConfirm={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
}

// Hook biar gampang dipanggil di file lain
export const useAlert = () => useContext(AlertContext);