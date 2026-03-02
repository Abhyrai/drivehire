import { useState, useRef, useEffect } from 'react';

export default function AutocompleteInput({ value, onChange, options, placeholder, label, name, required }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState(value || '');
    const ref = useRef(null);

    useEffect(() => { setSearch(value || ''); }, [value]);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase())).slice(0, 12);

    return (
        <div ref={ref} className="autocomplete-wrapper">
            {label && <label className="form-label">{label}</label>}
            <input
                name={name}
                className="form-input"
                placeholder={placeholder}
                value={search}
                required={required}
                autoComplete="off"
                onChange={(e) => {
                    setSearch(e.target.value);
                    onChange(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
            />
            {open && filtered.length > 0 && (
                <div className="autocomplete-dropdown">
                    {filtered.map(item => (
                        <div key={item} className={`autocomplete-item ${item === value ? 'selected' : ''}`}
                            onClick={() => { onChange(item); setSearch(item); setOpen(false); }}>
                            {item}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
