import { useState, useEffect } from 'react';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '../../services/api';
import { toast } from 'react-toastify';

const empty = { type: 'car', make: '', model: '', year: 2024, plateNumber: '', transmission: 'manual', fuelType: 'petrol', color: '' };

export default function MyVehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ ...empty });

    const load = async () => {
        try {
            const { data } = await getVehicles();
            setVehicles(data.vehicles);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { load(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await updateVehicle(editing, form);
                toast.success('Vehicle updated');
            } else {
                await addVehicle(form);
                toast.success('Vehicle added');
            }
            setShowForm(false);
            setEditing(null);
            setForm({ ...empty });
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleEdit = (v) => {
        setForm({ type: v.type, make: v.make, model: v.model, year: v.year, plateNumber: v.plateNumber, transmission: v.transmission, fuelType: v.fuelType, color: v.color || '' });
        setEditing(v._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this vehicle?')) return;
        try {
            await deleteVehicle(id);
            toast.success('Vehicle deleted');
            load();
        } catch (err) { toast.error('Error'); }
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>My Vehicles 🚗</h1>
                    <p>Manage your vehicles for booking a driver</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ ...empty }); }}>
                    {showForm ? 'Cancel' : '+ Add Vehicle'}
                </button>
            </div>

            {showForm && (
                <div className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>{editing ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Type</label>
                                <select name="type" className="form-select" value={form.type} onChange={handleChange}>
                                    <option value="car">Car</option>
                                    <option value="bike">Bike</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Transmission</label>
                                <select name="transmission" className="form-select" value={form.transmission} onChange={handleChange}>
                                    <option value="manual">Manual</option>
                                    <option value="automatic">Automatic</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Make</label>
                                <input name="make" className="form-input" placeholder="e.g. Hyundai" value={form.make} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Model</label>
                                <input name="model" className="form-input" placeholder="e.g. Creta" value={form.model} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Year</label>
                                <input type="number" name="year" className="form-input" min="1990" max="2030" value={form.year} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Plate Number</label>
                                <input name="plateNumber" className="form-input" placeholder="MH01AB1234" value={form.plateNumber} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Fuel Type</label>
                                <select name="fuelType" className="form-select" value={form.fuelType} onChange={handleChange}>
                                    <option value="petrol">Petrol</option>
                                    <option value="diesel">Diesel</option>
                                    <option value="electric">Electric</option>
                                    <option value="hybrid">Hybrid</option>
                                    <option value="cng">CNG</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Color</label>
                                <input name="color" className="form-input" placeholder="White" value={form.color} onChange={handleChange} />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">{editing ? 'Update Vehicle' : 'Add Vehicle'}</button>
                    </form>
                </div>
            )}

            <div className="drivers-grid">
                {vehicles.length === 0 ? (
                    <div className="glass-card empty-state">
                        <div className="empty-icon">🚗</div>
                        <h3>No vehicles added</h3>
                        <p>Add your vehicle to start booking drivers</p>
                    </div>
                ) : (
                    vehicles.map(v => (
                        <div key={v._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3>{v.make} {v.model} <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>{v.type}</span></h3>
                                <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
                                    {v.year} • {v.plateNumber} • {v.transmission} • {v.fuelType} {v.color && `• ${v.color}`}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(v)}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v._id)}>Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
