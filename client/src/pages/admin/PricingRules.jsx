import { useState, useEffect } from 'react';
import { getPricingRules, createPricingRule, updatePricingRule, deletePricingRule } from '../../services/api';
import { toast } from 'react-toastify';

const empty = { vehicleType: 'car', durationType: 'monthly', baseRate: 25000, experienceMultiplier: 1.5, cancellationPenaltyPercent: 10 };

export default function PricingRules() {
    const [rules, setRules] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ ...empty });

    const load = () => getPricingRules().then(res => setRules(res.data.rules)).catch(console.error);
    useEffect(() => { load(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, baseRate: Number(form.baseRate), experienceMultiplier: Number(form.experienceMultiplier), cancellationPenaltyPercent: Number(form.cancellationPenaltyPercent) };
            if (editing) { await updatePricingRule(editing, payload); toast.success('Rule updated'); }
            else { await createPricingRule(payload); toast.success('Rule created'); }
            setShowForm(false); setEditing(null); setForm({ ...empty }); load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleEdit = (r) => { setForm(r); setEditing(r._id); setShowForm(true); };
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this rule?')) return;
        try { await deletePricingRule(id); toast.success('Deleted'); load(); }
        catch (err) { toast.error('Error'); }
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><h1>Pricing Rules ⚙️</h1><p>Configure pricing for different vehicle types and durations</p></div>
                <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ ...empty }); }}>
                    {showForm ? 'Cancel' : '+ Add Rule'}
                </button>
            </div>

            {showForm && (
                <div className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Vehicle Type</label>
                                <select name="vehicleType" className="form-select" value={form.vehicleType} onChange={handleChange}>
                                    <option value="car">Car</option><option value="bike">Bike</option>
                                </select></div>
                            <div className="form-group"><label className="form-label">Duration Type</label>
                                <select name="durationType" className="form-select" value={form.durationType} onChange={handleChange}>
                                    <option value="monthly">Monthly</option>
                                </select></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Base Rate (₹)</label>
                                <input type="number" name="baseRate" className="form-input" value={form.baseRate} onChange={handleChange} required min="0" /></div>
                            <div className="form-group"><label className="form-label">Experience Multiplier (max)</label>
                                <input type="number" name="experienceMultiplier" className="form-input" step="0.1" value={form.experienceMultiplier} onChange={handleChange} required min="1" /></div>
                            <div className="form-group"><label className="form-label">Cancellation Penalty %</label>
                                <input type="number" name="cancellationPenaltyPercent" className="form-input" value={form.cancellationPenaltyPercent} onChange={handleChange} required min="0" max="100" /></div>
                        </div>
                        <button type="submit" className="btn btn-primary">{editing ? 'Update Rule' : 'Create Rule'}</button>
                    </form>
                </div>
            )}

            <div className="glass-card">
                {rules.length === 0 ? (
                    <div className="empty-state"><h3>No pricing rules configured</h3><p>Add your first rule to set rates</p></div>
                ) : (
                    <table className="data-table">
                        <thead><tr><th>Vehicle</th><th>Duration</th><th>Base Rate</th><th>Exp. Multiplier</th><th>Penalty %</th><th>Actions</th></tr></thead>
                        <tbody>
                            {rules.map(r => (
                                <tr key={r._id}>
                                    <td><span className="badge badge-primary">{r.vehicleType}</span></td>
                                    <td>{r.durationType}</td>
                                    <td style={{ fontWeight: 700 }}>₹{r.baseRate}</td>
                                    <td>{r.experienceMultiplier}x</td>
                                    <td>{r.cancellationPenaltyPercent}%</td>
                                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(r)}>Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
