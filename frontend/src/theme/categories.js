/** One muted color per status / category. Full class strings so Tailwind can see them. */
export const STATUS_STYLES = {
  DRAFT: { bg: 'bg-stone-light', text: 'text-stone', dot: 'bg-stone', icon: 'bg-stone-light text-stone' },
  SCHEDULED: { bg: 'bg-sky-light', text: 'text-sky', dot: 'bg-sky', icon: 'bg-sky-light text-sky' },
  QUEUED: { bg: 'bg-lilac-light', text: 'text-lilac', dot: 'bg-lilac', icon: 'bg-lilac-light text-lilac' },
  PROCESSING: { bg: 'bg-amber-light', text: 'text-amber', dot: 'bg-amber animate-pulseDot', icon: 'bg-amber-light text-amber' },
  RETRYING: { bg: 'bg-orange-light', text: 'text-orange', dot: 'bg-orange animate-pulseDot', icon: 'bg-orange-light text-orange' },
  SENT: { bg: 'bg-sage-light', text: 'text-sage', dot: 'bg-sage', icon: 'bg-sage-light text-sage' },
  FAILED: { bg: 'bg-coral-light', text: 'text-coral', dot: 'bg-coral', icon: 'bg-coral-light text-coral' },
  CANCELLED: { bg: 'bg-send-light', text: 'text-send', dot: 'bg-send', icon: 'bg-send-light text-send' },
  IMPORTED: { bg: 'bg-mist-light', text: 'text-mist', dot: 'bg-mist', icon: 'bg-mist-light text-mist' },
  NEW: { bg: 'bg-blush-light', text: 'text-blush', dot: 'bg-blush', icon: 'bg-blush-light text-blush' },
};

export const FILTER_STYLES = {
  ALL: { active: 'bg-ink text-white', idle: 'text-muted hover:bg-ink/[0.05] hover:text-ink' },
  DRAFT: { active: 'bg-stone text-white', idle: 'text-stone hover:bg-stone-light' },
  SCHEDULED: { active: 'bg-sky text-white', idle: 'text-sky hover:bg-sky-light' },
};

export const NAV_STYLES = {
  '/dashboard': { active: 'bg-sky-light text-sky', bar: 'bg-sky' },
  '/campaigns': { active: 'bg-sage-light text-sage', bar: 'bg-sage' },
  '/campaigns/new': { active: 'bg-lilac-light text-lilac', bar: 'bg-lilac' },
  '/how-to-use': { active: 'bg-amber-light text-amber', bar: 'bg-amber' },
};
