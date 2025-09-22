import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationSettingsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the first child page
    navigate('/notifications/strategies', { replace: true });
  }, [navigate]);

  return null;
};

export default NotificationSettingsPage;
