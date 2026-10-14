import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Users, Send, XCircle, Clock, Star, Trash2 } from 'lucide-react';
import AppShell from '../components/AppShell';
import Button from '../components/ui/Button';
import StatusChip from '../components/ui/StatusChip';
import SearchInput from '../components/ui/SearchInput';
import SlideOver from '../components/ui/SlideOver';
import api from '../services/api';
import usePolling from '../hooks/usePolling';

const StatCard = ({ icon: Icon, label, value, accent, tone }) => (
  <div className={`card-surface p-4 ${tone || ''}`}>
    <div className="flex items-center gap-2 mb-1.5">
      <Icon size={14} className={accent} />
      <p className="text-xs text-muted">{label}</p>
    </div>
    <p className="text-xl font-display font-semibold text-ink">{value}</p>
  </div>
);

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [leads, setLeads] = useState([]);
  const [emailJobs, setEmailJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [flashedIds, setFlashedIds] = useState(() => new Set());
  const prevStatus = useRef({});

  const fetchData = useCallback(async () => {
    try {
      const [campaignRes, leadsRes, jobsRes] = await Promise.all([
        api.get(`/campaigns/${id}`),
        api.get(`/leads/campaign/${id}`),
        api.get(`/email-jobs/campaign/${id}`),
      ]);
      setCampaign(campaignRes.data);
      setLeads(leadsRes.data);
      setEmailJobs(jobsRes.data);
      setError('');
    } catch (err) {
      console.error('Error fetching campaign detail:', err);
      setError('Could not load this campaign.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  usePolling(fetchData, 4000);

  useEffect(() => {
    const changed = new Set();
    emailJobs.forEach((job) => {
      const prev = prevStatus.current[job.id];
      if (prev && prev !== job.status) changed.add(job.id);
      prevStatus.current[job.id] = job.status;
    });
    if (changed.size === 0) return undefined;
    setFlashedIds(changed);
    const t = setTimeout(() => setFlashedIds(new Set()), 800);
    return () => clearTimeout(t);
  }, [emailJobs]);

  // Keep the slide-over's content fresh if the job's status changes while open.
  useEffect(() => {
    if (!selectedJob) return;
    const updated = emailJobs.find((j) => j.id === selectedJob.id);
    if (updated) setSelectedJob(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailJobs]);

  const handleToggleStar = async () => {
    try {
      const res = await api.patch(`/campaigns/${id}/star`);
      setCampaign(res.data);
    } catch (err) {
      console.error('Error starring campaign:', err);
    }
  };

  const handleDelete = async () => {
    if (!campaign) return;
    if (!window.confirm(`Delete "${campaign.name}"? This removes all its leads and email jobs too.`)) return;
    try {
      await api.delete(`/campaigns/${id}`);
      navigate('/campaigns');
    } catch (err) {
      console.error('Error deleting campaign:', err);
    }
  };

  const filteredJobs = useMemo(() => {
    if (!query.trim()) return emailJobs;
    const q = query.toLowerCase();
    return emailJobs.filter(
      (j) =>
        j.leadEmail?.toLowerCase().includes(q) ||
        j.subject?.toLowerCase().includes(q) ||
        j.status?.toLowerCase().includes(q)
    );
  }, [emailJobs, query]);

  if (loading) {
    return (
      <AppShell>
        <p className="text-muted text-sm">Loading...</p>
      </AppShell>
    );
  }

  if (error || !campaign) {
    return (
      <AppShell>
        <p className="text-coral text-sm">{error || 'Campaign not found.'}</p>
      </AppShell>
    );
  }

  const sentCount = emailJobs.filter((j) => j.status === 'SENT').length;
  const failedCount = emailJobs.filter((j) => j.status === 'FAILED').length;
  const pendingCount = emailJobs.filter((j) => ['SCHEDULED', 'RETRYING', 'PROCESSING'].includes(j.status)).length;

  return (
    <AppShell>
      <Link to="/campaigns" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors duration-150 mb-4">
        <ArrowLeft size={14} />
        Back to Campaigns
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3 min-w-0">
          <button
            onClick={handleToggleStar}
            className="mt-1 shrink-0 text-muted hover:text-amber transition-colors duration-150"
            aria-label={campaign.important ? 'Unstar campaign' : 'Star campaign'}
            title={campaign.important ? 'Unstar' : 'Mark as important'}
          >
            <Star size={18} className={campaign.important ? 'fill-amber text-amber' : ''} />
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl font-display font-semibold text-ink mb-1 truncate">{campaign.name}</h1>
            <p className="text-muted text-sm">{campaign.objective || 'No objective set'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusChip status={campaign.status} />
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        <StatCard icon={Users} label="Leads" value={leads.length} accent="text-mist" tone="bg-mist-light/40" />
        <StatCard icon={Clock} label="Pending" value={pendingCount} accent="text-amber" tone="bg-amber-light/50" />
        <StatCard icon={Send} label="Sent" value={sentCount} accent="text-sage" tone="bg-sage-light/50" />
        <StatCard icon={XCircle} label="Failed" value={failedCount} accent="text-coral" tone="bg-coral-light/50" />
        <StatCard icon={Mail} label="Hourly limit" value={campaign.hourlyLimit} accent="text-sky" tone="bg-sky-light/50" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="font-display text-lg font-semibold text-ink">Email Jobs</h2>
        <div className="w-full sm:w-72">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by lead, subject, or status..." />
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        {emailJobs.length === 0 ? (
          <p className="p-8 text-center text-muted text-sm">
            No email jobs yet — this campaign hasn't been scheduled.
          </p>
        ) : filteredJobs.length === 0 ? (
          <p className="p-8 text-center text-muted text-sm">No jobs match "{query}".</p>
        ) : (
          // Wrapped so the table scrolls horizontally on a narrow screen
          // instead of squeezing five columns into an unreadable width.
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full">
              <thead className="bg-paper border-b border-line">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Lead</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Subject</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Scheduled</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Attempts</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`row-hover cursor-pointer ${flashedIds.has(job.id) ? 'animate-flashRow' : ''}`}
                  >
                    <td className="px-5 py-3.5 text-sm text-ink">{job.leadEmail}</td>
                    <td className="px-5 py-3.5 text-sm text-ink/80 truncate max-w-xs">{job.subject}</td>
                    <td className="px-5 py-3.5 text-sm text-muted whitespace-nowrap">
                      {job.scheduledAt ? new Date(job.scheduledAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted">{job.attemptCount}</td>
                    <td className="px-5 py-3.5"><StatusChip status={job.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SlideOver open={!!selectedJob} onClose={() => setSelectedJob(null)} title="Email">
        {selectedJob && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <StatusChip status={selectedJob.status} />
              <span className="text-xs text-muted">{selectedJob.attemptCount} attempt{selectedJob.attemptCount === 1 ? '' : 's'}</span>
            </div>

            <div>
              <p className="text-xs text-muted mb-1">To</p>
              <p className="text-sm text-ink font-medium">{selectedJob.leadEmail}</p>
            </div>

            <div>
              <p className="text-xs text-muted mb-1">Subject</p>
              <p className="text-sm text-ink font-medium">{selectedJob.subject}</p>
            </div>

            <div>
              <p className="text-xs text-muted mb-1">Body</p>
              <div className="bg-paper border border-line rounded-lg p-4 text-sm text-ink whitespace-pre-wrap leading-relaxed">
                {selectedJob.body || 'No content available.'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-line">
              <div>
                <p className="text-xs text-muted mb-1">Scheduled at</p>
                <p className="text-sm text-ink">
                  {selectedJob.scheduledAt ? new Date(selectedJob.scheduledAt).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Sent at</p>
                <p className="text-sm text-ink">
                  {selectedJob.sentAt ? new Date(selectedJob.sentAt).toLocaleString() : 'Not yet sent'}
                </p>
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </AppShell>
  );
};

export default CampaignDetail;
