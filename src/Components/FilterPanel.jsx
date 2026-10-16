export default function FilterPanel({
  filters
}) {
  return <div className="router-grid">
 <label>Specialty<select aria-label="Specialty" value={filters.specialty} onChange={e => filters.setSpecialty(e.target.value)}><option>All</option>{filters.specialties.map(s => <option key={s}>{s}</option>)}</select></label>
 <label>Maximum consultation fee<input aria-label="Maximum consultation fee" type="number" min="0" value={filters.maxFee} placeholder="Any fee" onChange={e => filters.setMaxFee(e.target.value)} /></label>
 <label>Minimum rating<select aria-label="Minimum rating" value={filters.minRating} onChange={e => filters.setMinRating(e.target.value)}><option value="0">Any rating</option><option value="4">4 and above</option><option value="4.5">4.5 and above</option><option value="4.8">4.8 and above</option></select></label>
 <label>Availability<select aria-label="Availability" value={filters.availability} onChange={e => filters.setAvailability(e.target.value)}><option>All</option><option>Available</option><option>Unavailable</option></select></label>
 <button className="router-button secondary" onClick={filters.clearFilters}>Clear Filters</button>
 </div>;
}
