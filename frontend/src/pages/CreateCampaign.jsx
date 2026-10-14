import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, XCircle, Copy, X } from 'lucide-react';
import AppShell from '../components/AppShell';
import Button from '../components/ui/Button';
import api from '../services/api';

const STEPS = [
  { n: 1, label: 'Campaign details', color: 'bg-sky text-white', labelColor: 'text-sky' },
  { n: 2, label: 'Upload leads', color: 'bg-mist text-white', labelColor: 'text-mist' },
  { n: 3, label: 'Review & schedule', color: 'bg-sage text-white', labelColor: 'text-sage' },
];

const StepIndicator = ({ current }) => (
  <div className="flex items-center mb-8">
    {STEPS.map((s, i) => (
      <div key={s.n} className="flex items-center">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold font-display transition-colors duration-200 ${
              current >= s.n ? s.color : 'bg-line text-muted'
            }`}
          >
            {current > s.n ? <CheckCircle2 size={14} /> : s.n}
          </div>
          <span className={`text-sm font-medium hidden sm:block ${current === s.n ? s.labelColor : 'text-muted'}`}>
            {s.label}
          </span>
        </div>
        {i < STEPS.length - 1 && <div className="w-8 sm:w-16 h-px bg-line mx-3" />}
      </div>
    ))}
  </div>
);

const FieldLabel = ({ children, hint }) => (
  <label className="block text-sm font-medium text-ink mb-1.5">
    {children}
    {hint && <span className="text-muted font-normal ml-1.5">{hint}</span>}
  </label>
);

const inputClass =
  'block w-full border border-line rounded-lg py-2.5 px-3.5 text-sm transition-shadow duration-150 ' +
  'placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-send/30 focus:border-send';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [campaignId, setCampaignId] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    objective: '',
    startTime: '',
    hourlyLimit: 100,
    delaySeconds: 2,
  });

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/campaigns', formData);
      setCampaignId(res.data.id);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadCsv = async () => {
    if (!file) {
      setError('Please choose a CSV file first.');
      return;
    }
    setLoading(true);
    setError('');
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await api.post(`/leads/campaign/${campaignId}/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult(res.data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleCampaign = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post(`/campaigns/${campaignId}/schedule`);
      navigate(`/campaigns/${campaignId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule campaign');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  return (
    <AppShell>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-display font-semibold text-ink mb-1">Create Campaign</h1>
        <p className="text-muted text-sm mb-8">Set the pace, upload your leads, and schedule the send.</p>

        <StepIndicator current={step} />

        {error && (
          <div className="mb-5 bg-coral-light border border-coral/20 text-coral text-sm px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}><X size={14} /></button>
          </div>
        )}

        <div className="card-surface p-7">
          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleCreateCampaign} className="space-y-5">
              <div>
                <FieldLabel>Campaign Name</FieldLabel>
                <input
                  type="text"
                  required
                  placeholder="e.g., CRM Product Outreach"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel hint="Used to personalize each lead's email">Objective / Target Audience</FieldLabel>
                <textarea
                  rows={3}
                  placeholder="e.g., Reach CTOs of Indian SaaS companies..."
                  value={formData.objective}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <FieldLabel>Start Time</FieldLabel>
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Hourly Limit</FieldLabel>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.hourlyLimit}
                    onChange={(e) => setFormData({ ...formData, hourlyLimit: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel>Delay (seconds)</FieldLabel>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.delaySeconds}
                    onChange={(e) => setFormData({ ...formData, delaySeconds: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Next: Upload Leads'}
                </Button>
              </div>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink mb-1">Upload your leads</h3>
                <p className="text-sm text-muted">
                  CSV columns required: <code className="bg-line/50 px-1.5 py-0.5 rounded text-ink">name, email, company, designation</code>
                </p>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-150 ${
                  dragOver ? 'border-send bg-send-light' : 'border-line hover:border-send/50 hover:bg-send-light/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-ink">
                    <FileText size={18} className="text-send" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={26} className="mx-auto mb-2 text-muted" />
                    <p className="text-sm text-ink font-medium">Drop your CSV here, or click to browse</p>
                    <p className="text-xs text-muted mt-1">One row per lead</p>
                  </>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleUploadCsv} disabled={loading}>
                  {loading ? 'Uploading...' : 'Upload & Continue'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && importResult && (
            <div className="text-center">
              <CheckCircle2 size={32} className="mx-auto text-send mb-3" />
              <h3 className="font-display text-lg font-semibold text-ink mb-1">Import complete</h3>
              <p className="text-sm text-muted mb-6">{importResult.totalProcessed} rows processed</p>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-paper border border-line p-4 rounded-lg">
                  <p className="text-2xl font-display font-semibold text-ink">{importResult.validLeads}</p>
                  <p className="text-xs text-muted mt-0.5">Valid leads</p>
                </div>
                <div className="bg-paper border border-line p-4 rounded-lg">
                  <p className="text-2xl font-display font-semibold text-ink">{importResult.invalidEmails}</p>
                  <p className="text-xs text-muted mt-0.5 flex items-center justify-center gap-1">
                    <XCircle size={11} className="text-coral" /> Invalid
                  </p>
                </div>
                <div className="bg-paper border border-line p-4 rounded-lg">
                  <p className="text-2xl font-display font-semibold text-ink">{importResult.duplicates}</p>
                  <p className="text-xs text-muted mt-0.5 flex items-center justify-center gap-1">
                    <Copy size={11} /> Duplicates
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-3">
                <Button variant="secondary" onClick={() => navigate('/campaigns')}>
                  Skip for now
                </Button>
                <Button
                  onClick={handleScheduleCampaign}
                  disabled={loading || importResult.validLeads === 0}
                >
                  {loading ? 'Scheduling...' : 'Schedule Campaign'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default CreateCampaign;
