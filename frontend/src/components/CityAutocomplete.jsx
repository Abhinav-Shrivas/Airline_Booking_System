import { useEffect, useRef, useState } from 'react';
import { searchCities } from '../api/flights';
import { extractApiError } from '../utils/formatters';

let globalCitiesCache = null;
let fetchPromise = null;

export default function CityAutocomplete({ label, value, onChange, placeholder }) {
  const [query, setQuery] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value?.name || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // Fetch all cities exactly once and cache them
        if (!globalCitiesCache) {
          if (!fetchPromise) {
            fetchPromise = searchCities('');
          }
          globalCitiesCache = await fetchPromise;
        }

        const allCities = globalCitiesCache || [];
        
        // Filter locally instead of hitting the API
        if (!query) {
          setSuggestions(allCities);
        } else {
          const lowerQuery = query.toLowerCase();
          const filtered = allCities.filter(city => city.name.toLowerCase().includes(lowerQuery));
          
          // Sort: cities starting with the query come first, then alphabetical
          filtered.sort((a, b) => {
            const aStarts = a.name.toLowerCase().startsWith(lowerQuery);
            const bStarts = b.name.toLowerCase().startsWith(lowerQuery);
            
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            
            // Alphabetical tie-breaker
            return a.name.localeCompare(b.name);
          });
          
          setSuggestions(filtered);
        }
      } catch (err) {
        setSuggestions([]);
        console.error(extractApiError(err));
      } finally {
        setLoading(false);
      }
    }, 150); // Reduced debounce time since it's local now

    return () => clearTimeout(timer);
  }, [query, open]);

  const handleSelect = (city) => {
    onChange(city);
    setQuery(city.name);
    setOpen(false);
  };

  return (
    <div className="form-group autocomplete" ref={wrapperRef}>
      <label>{label}</label>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && (
        <ul className="autocomplete-dropdown">
          {loading && <li className="autocomplete-item muted">Searching...</li>}
          {!loading && suggestions.length === 0 && query && (
            <li className="autocomplete-item muted">No cities found</li>
          )}
          {!loading &&
            suggestions.map((city) => (
              <li key={city.id}>
                <button
                  type="button"
                  className="autocomplete-item"
                  onClick={() => handleSelect(city)}
                >
                  {city.name}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
