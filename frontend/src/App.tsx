import React, { useEffect } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { setNavigator } from './utils/navigateHelper';


const App: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  return (
    <>
      <ToastContainer position='top-right' autoClose={2000} />
      <AppRoutes />
    </>
  )
}

export default App
