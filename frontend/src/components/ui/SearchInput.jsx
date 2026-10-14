import { Search } from 'lucide-react';

const SearchInput = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative">
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-9 pr-4 py-2 border border-line rounded-lg text-sm bg-white
                 placeholder:text-muted/70 transition-all duration-150
                 hover:border-ink/20
                 focus:outline-none focus:ring-2 focus:ring-send/25 focus:border-send"
    />
  </div>
);

export default SearchInput;
