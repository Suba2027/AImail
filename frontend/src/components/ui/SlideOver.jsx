import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * A right-side slide-over rather than a centered modal - this is meant to
 * feel like inspecting one row of the table in place, not interrupting the
 * page with an unrelated dialog.
 */
const SlideOver = ({ open, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-ink/30 animate-fadeIn"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-slideIn flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-line">
          <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink hover:bg-ink/[0.05] rounded-full p-1.5 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

export default SlideOver;
