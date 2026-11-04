import { useState } from 'react';
import Alert from '../components/Alert';
import { AlertContext } from './alertStore';

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);

  const showAlert = (title, message, type = 'success', onConfirmExtra = null, icon = null) => {
    setAlert({ title, message, type, onConfirmExtra, icon });
  };

  const hideAlert = () => {
    if (alert?.onConfirmExtra) alert.onConfirmExtra();
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <Alert
          title={alert.title}
          message={alert.message}
          type={alert.type}
          icon={alert.icon}
          onConfirm={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
}
