import { UserPlus, FileSpreadsheet, SlidersHorizontal, Send, Eye } from 'lucide-react';
import AppShell from '../components/AppShell';

const STEPS = [
  {
    n: 1,
    icon: UserPlus,
    title: 'Create a campaign',
    tone: 'bg-sky-light text-sky',
    label: 'text-sky',
    body:
      'Give it a name, describe your objective or target audience (this personalizes each email if AI is enabled), and choose a start time.',
  },
  {
    n: 2,
    icon: SlidersHorizontal,
    title: 'Set the pace',
    tone: 'bg-amber-light text-amber',
    label: 'text-amber',
    body:
      'Choose an hourly limit and a minimum delay between sends. ReachAI uses whichever is more conservative, so you never exceed either constraint.',
  },
  {
    n: 3,
    icon: FileSpreadsheet,
    title: 'Upload your leads',
    tone: 'bg-mist-light text-mist',
    label: 'text-mist',
    body:
      'A CSV with columns name, email, company, designation. Invalid emails and duplicates are automatically filtered out and reported back to you.',
  },
  {
    n: 4,
    icon: Send,
    title: 'Schedule it',
    tone: 'bg-lilac-light text-lilac',
    label: 'text-lilac',
    body:
      "This is the step that actually starts things moving — it creates one email job per lead, staggers each one's send time, and queues them. Nothing sends until you do this.",
  },
  {
    n: 5,
    icon: Eye,
    title: 'Watch it run',
    tone: 'bg-sage-light text-sage',
    label: 'text-sage',
    body:
      'Open the campaign to see every email\'s status update live — scheduled, processing, sent, or retrying. Click any row to read its full content.',
  },
];

const HowToUse = () => (
  <AppShell>
    <div className="max-w-2xl">
      <h1 className="text-2xl font-display font-semibold text-ink mb-1">How to use ReachAI</h1>
      <p className="text-muted text-sm mb-10">
        Five steps from an idea to a sent campaign.
      </p>

      <div className="space-y-0">
        {STEPS.map(({ n, icon: Icon, title, body, tone, label }, i) => (
          <div key={n} className="flex gap-5">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tone}`}>
                <Icon size={17} />
              </div>
              {i < STEPS.length - 1 && <div className="w-px flex-1 bg-line my-1" />}
            </div>
            <div className={i < STEPS.length - 1 ? 'pb-8' : ''}>
              <p className={`text-xs font-medium mb-1 ${label}`}>Step {n}</p>
              <h3 className="font-display text-base font-semibold text-ink mb-1.5">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 card-surface p-5">
        <p className="text-sm text-ink font-medium mb-1">A note on reliability</p>
        <p className="text-sm text-muted leading-relaxed">
          If a send fails, it automatically retries with increasing delay (10s, then 30s, then 60s)
          before being marked as failed after 3 attempts. If your hourly limit is reached, remaining
          emails are safely rescheduled for the next window — nothing is dropped or duplicated.
        </p>
      </div>
    </div>
  </AppShell>
);

export default HowToUse;
