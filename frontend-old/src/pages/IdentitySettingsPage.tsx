import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const IdentitySettingsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the first child page
    navigate('/identity/users', { replace: true });
  }, [navigate]);

  return null;
};

export default IdentitySettingsPage;
