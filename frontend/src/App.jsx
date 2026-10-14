import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetail from './pages/CampaignDetail';
import HowToUse from './pages/HowToUse';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns"
        element={
          <ProtectedRoute>
            <Campaigns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/new"
        element={
          <ProtectedRoute>
            <CreateCampaign />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/:id"
        element={
          <ProtectedRoute>
            <CampaignDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/how-to-use"
        element={
          <ProtectedRoute>
            <HowToUse />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
