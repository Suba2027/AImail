import { createContext, useCallback, useContext, useState } from 'react';
import api from '../services/api';
import usePolling from '../hooks/usePolling';

const LiveActivityContext = createContext({
  hasActiveCampaign: false,
  updatedAt: null,
});

export const LiveActivityProvider = ({ children }) => {
  const [hasActiveCampaign, setHasActiveCampaign] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get('/campaigns');
      setHasActiveCampaign(res.data.some((c) => c.status === 'SCHEDULED'));
      setUpdatedAt(Date.now());
    } catch {
      // live indicator is non-critical
    }
  }, []);

  usePolling(refresh, 5000);

  return (
    <LiveActivityContext.Provider value={{ hasActiveCampaign, updatedAt }}>
      {children}
    </LiveActivityContext.Provider>
  );
};

export const useLiveActivity = () => useContext(LiveActivityContext);
