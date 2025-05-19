import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../redux/store';

const RoleRedirector: React.FC = () => {
  const navigate = useNavigate();
  const role = useSelector((state: RootState) => state.auth.user?.role);

  useEffect(() => {
    if (role === 'owner') {
      navigate('/owner/dashboard');
    } else if (role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [role, navigate]);

  return null;
};

export default RoleRedirector;
