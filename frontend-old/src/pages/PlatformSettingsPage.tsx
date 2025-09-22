import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PlatformSettingsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the first child page
    navigate('/settings/tags', { replace: true });
  }, [navigate]);

  return null;
};

export default PlatformSettingsPage;
