import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Trash2 } from 'lucide-react';
import AppShell from '../components/AppShell';
import Button from '../components/ui/Button';
import StatusChip from '../components/ui/StatusChip';
import SearchInput from '../components/ui/SearchInput';
import api from '../services/api';
import usePolling from '../hooks/usePolling';
import { FILTER_STYLES } from '../theme/categories';

const FILTERS = ['ALL', 'DRAFT', 'SCHEDULED'];

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');

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

  const handleToggleStar = async (e, campaignId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.patch(`/campaigns/${campaignId}/star`);
      setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? res.data : c)));
    } catch (err) {
      console.error('Error starring campaign:', err);
    }
  };

  const handleDelete = async (e, campaignId, name) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete "${name}"? This removes all its leads and email jobs too.`)) return;
    try {
      await api.delete(`/campaigns/${campaignId}`);
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    } catch (err) {
      console.error('Error deleting campaign:', err);
    }
  };

  const filtered = useMemo(() => {
    const result = campaigns.filter((c) => {
      const matchesFilter = filter === 'ALL' || c.status === filter;
      const matchesQuery =
        !query.trim() ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        (c.objective || '').toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
    // Stable sort: important campaigns first, otherwise keep existing order.
    return [...result].sort((a, b) => (b.important === true) - (a.important === true));
  }, [campaigns, query, filter]);

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink">Campaigns</h1>
          <p className="text-muted text-sm mt-1">{campaigns.length} total</p>
        </div>
        <Link to="/campaigns/new" className="self-start sm:self-auto">
          <Button>+ New Campaign</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex gap-1.5 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                filter === f ? FILTER_STYLES[f].active : FILTER_STYLES[f].idle
              }`}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-72">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by name or objective..." />
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
        <p className="text-muted text-sm py-10 text-center">
          No campaigns match your search{filter !== 'ALL' ? ` in "${filter.toLowerCase()}"` : ''}.
        </p>
      ) : (
        <div className="card-surface divide-y divide-line overflow-hidden">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to={`/campaigns/${c.id}`}
              className="row-hover flex items-center justify-between gap-3 px-4 sm:px-5 py-4 group"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <button
                  onClick={(e) => handleToggleStar(e, c.id)}
                  className="shrink-0 text-muted hover:text-amber transition-colors duration-150"
                  aria-label={c.important ? 'Unstar campaign' : 'Star campaign'}
                  title={c.important ? 'Unstar' : 'Mark as important'}
                >
                  <Star size={16} className={c.important ? 'fill-amber text-amber' : ''} />
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{c.name}</p>
                  <p className="text-xs text-muted mt-0.5 truncate">
                    {c.objective || 'No objective set'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                <div className="text-right text-xs text-muted hidden md:block">
                  <p>{c.hourlyLimit}/hr &middot; {c.delaySeconds}s delay</p>
                </div>
                <StatusChip status={c.status} />
                {/*
                  Delete is a real action, not decoration, so it can't rely on
                  hover to become visible - a phone has no hover at all. It's
                  always shown from `lg` down; only on a large pointer-driven
                  screen does it fade in on hover, purely as a visual nicety.
                */}
                <button
                  onClick={(e) => handleDelete(e, c.id, c.name)}
                  className="text-muted hover:text-coral transition-all duration-150 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                  aria-label="Delete campaign"
                  title="Delete campaign"
                >
                  <Trash2 size={15} />
                </button>
                <ArrowRight size={15} className="hidden sm:block text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Campaigns;
