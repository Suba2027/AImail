import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileEdit, Send, Layers, ArrowRight } from 'lucide-react';
import AppShell from '../components/AppShell';
import Button from '../components/ui/Button';
import StatusChip from '../components/ui/StatusChip';
import SearchInput from '../components/ui/SearchInput';
import api from '../services/api';
import usePolling from '../hooks/usePolling';
import { STATUS_STYLES } from '../theme/categories';

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="card-surface p-5 transition-all duration-150 hover:shadow-sm hover:border-ink/10">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${accent}`}>
      <Icon size={16} />
    </div>
    <p className="text-2xl font-display font-semibold text-ink">{value}</p>
    <p className="text-xs text-muted mt-0.5">{label}</p>
  </div>
);

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await api.get('/campaigns');
      setCampaigns(res.data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(fetchCampaigns, 4000);

  const counts = campaigns.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    },
    { DRAFT: 0, SCHEDULED: 0 }
  );

  const filtered = useMemo(() => {
    const recent = [...campaigns]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
    if (!query.trim()) return recent;
    return recent.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
  }, [campaigns, query]);

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink">Dashboard</h1>
          <p className="text-muted text-sm mt-1">A quick look at everything you're running.</p>
        </div>
        <Link to="/campaigns/new" className="self-start sm:self-auto">
          <Button>
            + New Campaign
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard icon={FileEdit} label="Draft campaigns" value={counts.DRAFT} accent={STATUS_STYLES.DRAFT.icon} />
        <StatCard icon={Send} label="Scheduled campaigns" value={counts.SCHEDULED} accent={STATUS_STYLES.SCHEDULED.icon} />
        <StatCard icon={Layers} label="Total campaigns" value={campaigns.length} accent={STATUS_STYLES.SENT.icon} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">Recent Campaigns</h2>
        <div className="w-full sm:w-64">
          <SearchInput value={query} onChange={setQuery} placeholder="Search campaigns..." />
        </div>
      </div>

      {loading ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : campaigns.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <p className="text-ink font-medium mb-1">No campaigns yet</p>
          <p className="text-muted text-sm mb-4">Create your first campaign to start reaching leads.</p>
          <Link to="/campaigns/new">
            <Button variant="secondary">Create a campaign</Button>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted text-sm py-6 text-center">No campaigns match "{query}".</p>
      ) : (
        <div className="card-surface divide-y divide-line overflow-hidden">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to={`/campaigns/${c.id}`}
              className="row-hover flex items-center justify-between gap-3 px-4 sm:px-5 py-4 group"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{c.name}</p>
                <p className="text-xs text-muted mt-0.5 truncate">{c.objective || 'No objective set'}</p>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <StatusChip status={c.status} />
                <ArrowRight size={15} className="hidden sm:block text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Dashboard;
