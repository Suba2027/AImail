import { Mail, Check, Clock } from 'lucide-react';

const INBOX_ROWS = [
  { to: 'priya@acme.io', subject: 'Quick intro for Acme', status: 'Queued', tone: 'text-white bg-lilac' },
  { to: 'james@north.co', subject: 'Following up on last week', status: 'Sending', tone: 'text-white bg-amber' },
  { to: 'aya@lumen.app', subject: 'Thoughts on Q3 outreach', status: 'Delivered', tone: 'text-white bg-sage' },
];

const Login = () => {
  const handleGoogleLogin = () => {
    // Full page navigation - required so the browser can follow Google's
    // OAuth redirect chain. An axios/XHR call cannot follow this.
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[48%] bg-plum text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 0.6px, transparent 0.6px)',
          backgroundSize: '18px 18px',
        }} />

        <div className="relative flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">R</span>
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">ReachAI</span>
        </div>

        <div className="relative">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40 mb-4 font-medium">Campaigns, paced</p>
          <h1 className="font-display text-[2.35rem] font-semibold leading-[1.15] mb-4 max-w-md">
            Send campaigns at a human pace.
          </h1>
          <p className="text-white/50 max-w-sm mb-10 text-[0.95rem] leading-relaxed">
            Upload leads, set a rate, and let ReachAI stagger each send — no bursts, no duplicates.
          </p>

          <div className="animate-inboxDrift max-w-md space-y-2">
            {INBOX_ROWS.map((row) => (
              <div
                key={row.to}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  {row.status === 'Delivered' ? <Check size={13} /> : row.status === 'Sending' ? <Mail size={13} /> : <Clock size={13} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white/80 truncate">{row.subject}</p>
                  <p className="text-[11px] text-white/40 truncate">{row.to}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 inline-flex items-center gap-1.5 ${row.tone}`}>
                  {row.status === 'Sending' && <span className="w-1 h-1 rounded-full bg-white animate-pulseDot" />}
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/30 text-xs">
          Sign in with the Google account you send from.
        </p>
      </div>

      <div className="w-full lg:w-[52%] flex items-center justify-center bg-paper p-8">
        <div className="w-full max-w-[420px] bg-white border border-line rounded-2xl shadow-[0_8px_30px_rgba(20,20,24,0.04)] p-8">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-7 h-7 rounded-md bg-send flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">R</span>
            </div>
            <span className="font-display font-semibold text-lg">ReachAI</span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-ink mb-2">Sign in to ReachAI</h2>
          <p className="text-muted text-sm mb-8 leading-relaxed">
            Use Google to authenticate and send mail from your own account.
          </p>

          <button
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-white border border-line rounded-xl px-4 flex items-center justify-center gap-3
                       text-sm font-medium text-ink transition-all duration-150 ease-out
                       hover:border-ink/20 hover:shadow-md hover:-translate-y-px
                       active:translate-y-0 active:scale-[0.98]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.92c1.7-1.57 2.68-3.88 2.68-6.64z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34C2.44 15.98 5.48 18 9 18z"/>
              <path fill="#FBBC05" d="M3.97 10.71c-.18-.54-.28-1.11-.28-1.71s.1-1.17.28-1.71V4.95H.96C.35 6.17 0 7.55 0 9s.35 2.83.96 4.05l3.01-2.34z"/>
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-muted text-center mt-8 leading-relaxed">
            After signing in, the How to Use guide walks through your first campaign.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
