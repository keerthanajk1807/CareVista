import { forwardRef } from 'react';
export default forwardRef(function SearchBar({
  value,
  onChange
}, ref) {
  return <input ref={ref} aria-label="Search doctors" placeholder="Search doctor or specialty" value={value} onChange={e => onChange(e.target.value)} />;
});
