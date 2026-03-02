import { useState, useEffect } from 'react';
import { getAdminDrivers, approveDriver, rejectDriver, getDriverDocuments, verifyDriverDocuments, getServerURL } from '../../services/api';
import { toast } from 'react-toastify';
import { FiFileText, FiCheckCircle, FiXCircle, FiEye, FiX } from 'react-icons/fi';

export default function ManageDrivers() {
    const [drivers, setDrivers] = useState([]);
    const [tab, setTab] = useState('pending');
    const [docModal, setDocModal] = useState(null); // { driver data }
    const [docLoading, setDocLoading] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [verifyLoading, setVerifyLoading] = useState(false);

    const load = async () => {
        try {
            const params = tab !== 'all' ? { status: tab } : {};
            const { data } = await getAdminDrivers(params);
            setDrivers(data.drivers);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { load(); }, [tab]);

    const handleApprove = async (id) => {
        try { await approveDriver(id); toast.success('Driver approved!'); load(); }
        catch (err) { toast.error('Error'); }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject this driver?')) return;
        try { await rejectDriver(id); toast.info('Driver rejected'); load(); }
        catch (err) { toast.error('Error'); }
    };

    const openDocModal = async (driverId) => {
        setDocLoading(true);
        setDocModal(null);
        try {
            const { data } = await getDriverDocuments(driverId);
            setDocModal(data.driver);
            setRemarks('');
        } catch (err) { toast.error('Could not load documents'); }
        finally { setDocLoading(false); }
    };

    const handleVerify = async (action) => {
        if (action === 'reject' && !remarks.trim()) {
            toast.error('Please provide rejection remarks');
            return;
        }
        setVerifyLoading(true);
        try {
            await verifyDriverDocuments(docModal._id, { action, remarks });
            toast.success(action === 'verify' ? 'Documents verified!' : 'Documents rejected');
            setDocModal(null);
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setVerifyLoading(false); }
    };

    const docStatusBadge = (status) => {
        const map = {
            not_uploaded: { label: 'No Docs', cls: 'badge-secondary' },
            pending_review: { label: '📋 Pending Review', cls: 'badge-warning' },
            verified: { label: '✅ Verified', cls: 'badge-success' },
            rejected: { label: '❌ Rejected', cls: 'badge-danger' },
        };
        const s = map[status] || map.not_uploaded;
        return <span className={`badge ${s.cls}`}>{s.label}</span>;
    };

    return (
        <div>
            <div className="page-header"><h1>Manage Drivers 🚗</h1><p>Approve, reject, and verify driver documents</p></div>

            <div className="tabs-sticky">
                <div className="tabs-scroll">
                    {['pending', 'approved', 'rejected', 'all'].map(t => (
                        <button key={t} className={`tab-pill ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="drivers-grid">
                {drivers.length === 0 ? (
                    <div className="glass-card empty-state"><div className="empty-icon">🚗</div><h3>No {tab} drivers</h3></div>
                ) : (
                    drivers.map(d => (
                        <div key={d._id} className="glass-card" style={{ padding: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', marginBottom: 'var(--space-sm)', flexWrap: 'wrap' }}>
                                <div className="driver-avatar" style={{ width: 40, height: 40, flexShrink: 0 }}>
                                    {d.userId?.name?.charAt(0) || 'D'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h4 style={{ margin: 0, fontSize: 'var(--font-sm)' }}>{d.userId?.name} {d.userId?.isBlocked && <span className="badge badge-danger" style={{ fontSize: '9px' }}>Blocked</span>}</h4>
                                    <p className="text-sm text-muted" style={{ margin: 0, wordBreak: 'break-all', fontSize: '11px' }}>{d.userId?.email} • {d.userId?.phone}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
                                <span className={`badge ${d.isApproved === 'approved' ? 'badge-success' : d.isApproved === 'rejected' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '10px' }}>
                                    {d.isApproved}
                                </span>
                                {docStatusBadge(d.documentStatus)}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                                <span>📍 {d.city}</span>
                                <span>🪪 {d.licenseNumber}</span>
                                <span>📅 {d.experience} yrs exp</span>
                                <span>🚗 {d.vehicleTypes?.join(', ')}</span>
                                <span>⚙️ {d.transmissions?.join(', ')}</span>
                                <span>⭐ {d.rating || 'No rating'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button className="btn btn-secondary btn-sm" onClick={() => openDocModal(d._id)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <FiFileText /> View Documents
                                </button>
                                {d.isApproved === 'pending' && (
                                    <>
                                        <button className="btn btn-primary btn-sm" onClick={() => handleApprove(d._id)}>✅ Approve</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleReject(d._id)}>❌ Reject</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Document Loading Indicator */}
            {docLoading && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="spinner"></div>
                </div>
            )}

            {/* Document Review Modal */}
            {docModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)'
                }} onClick={() => setDocModal(null)}>
                    <div className="glass-card" style={{
                        maxWidth: 700, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                            <h3>📋 Document Review — {docModal.name}</h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => setDocModal(null)} style={{ padding: '4px 8px' }}><FiX /></button>
                        </div>

                        {/* Driver Info */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr',
                            gap: 'var(--space-xs)',
                            background: 'var(--bg-secondary)', padding: 'var(--space-md)',
                            borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-lg)',
                            fontSize: 'var(--font-sm)', wordBreak: 'break-all'
                        }}>
                            <div><strong>Email:</strong> {docModal.email}</div>
                            <div><strong>Phone:</strong> {docModal.phone}</div>
                            <div><strong>City:</strong> {docModal.city}</div>
                            <div><strong>Experience:</strong> {docModal.experience} years</div>
                            <div><strong>License #:</strong> {docModal.licenseNumber || '—'}</div>
                            <div><strong>Aadhaar #:</strong> {docModal.aadhaarNumber ? `XXXX XXXX ${docModal.aadhaarNumber.slice(-4)}` : '—'}</div>
                        </div>

                        {/* Document Status */}
                        <div style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <strong>Status:</strong> {docStatusBadge(docModal.documentStatus)}
                            {docModal.verifiedAt && <span className="text-sm text-muted"> — Verified {new Date(docModal.verifiedAt).toLocaleDateString()}</span>}
                        </div>

                        {/* Document Images */}
                        <div className="doc-cards-row" style={{ marginBottom: 'var(--space-lg)' }}>
                            <div>
                                <h4 style={{ marginBottom: 'var(--space-sm)', fontSize: 'var(--font-sm)' }}>🪪 Driving License</h4>
                                {docModal.licenseImage ? (
                                    <div style={{
                                        borderRadius: 'var(--radius-md)', overflow: 'hidden',
                                        border: '2px solid var(--border)', height: 200,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'var(--bg-primary)', cursor: 'pointer'
                                    }} onClick={() => window.open(`${getServerURL()}${docModal.licenseImage}`, '_blank')}>
                                        <img src={`${getServerURL()}${docModal.licenseImage}`} alt="License"
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    </div>
                                ) : (
                                    <div style={{
                                        height: 200, borderRadius: 'var(--radius-md)',
                                        border: '2px dashed var(--border)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
                                    }}>Not uploaded</div>
                                )}
                            </div>
                            <div>
                                <h4 style={{ marginBottom: 'var(--space-sm)', fontSize: 'var(--font-sm)' }}>🆔 Aadhaar Card</h4>
                                {docModal.aadhaarImage ? (
                                    <div style={{
                                        borderRadius: 'var(--radius-md)', overflow: 'hidden',
                                        border: '2px solid var(--border)', height: 200,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'var(--bg-primary)', cursor: 'pointer'
                                    }} onClick={() => window.open(`${getServerURL()}${docModal.aadhaarImage}`, '_blank')}>
                                        <img src={`${getServerURL()}${docModal.aadhaarImage}`} alt="Aadhaar"
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    </div>
                                ) : (
                                    <div style={{
                                        height: 200, borderRadius: 'var(--radius-md)',
                                        border: '2px dashed var(--border)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
                                    }}>Not uploaded</div>
                                )}
                            </div>
                        </div>

                        {/* ID Proof (if exists) */}
                        {docModal.idProofImage && (
                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <h4 style={{ marginBottom: 'var(--space-sm)', fontSize: 'var(--font-sm)' }}>📄 Additional ID Proof</h4>
                                <div style={{
                                    borderRadius: 'var(--radius-md)', overflow: 'hidden',
                                    border: '2px solid var(--border)', height: 180, maxWidth: 300,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'var(--bg-primary)', cursor: 'pointer'
                                }} onClick={() => window.open(`${getServerURL()}${docModal.idProofImage}`, '_blank')}>
                                    <img src={`${getServerURL()}${docModal.idProofImage}`} alt="ID Proof"
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                </div>
                            </div>
                        )}

                        {/* Previous Remarks */}
                        {docModal.verificationRemarks && (
                            <div style={{
                                padding: 'var(--space-md)', borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-secondary)', marginBottom: 'var(--space-lg)',
                                fontSize: 'var(--font-sm)'
                            }}>
                                <strong>Previous Remarks:</strong> {docModal.verificationRemarks}
                            </div>
                        )}

                        {/* Verify / Reject Actions */}
                        {docModal.documentStatus === 'pending_review' && (
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-lg)' }}>
                                <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                                    <label className="form-label">Remarks (required for rejection)</label>
                                    <textarea
                                        className="form-input" rows={3}
                                        placeholder="e.g. Aadhaar card image is blurry, please re-upload..."
                                        value={remarks} onChange={e => setRemarks(e.target.value)}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleVerify('verify')}
                                        disabled={verifyLoading || (!docModal.licenseImage && !docModal.aadhaarImage)}
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <FiCheckCircle /> {verifyLoading ? 'Processing...' : 'Verify & Approve'}
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleVerify('reject')}
                                        disabled={verifyLoading}
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        <FiXCircle /> {verifyLoading ? 'Processing...' : 'Reject Documents'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Already rejected — waiting for re-upload */}
                        {docModal.documentStatus === 'rejected' && (
                            <div style={{
                                padding: 'var(--space-md) var(--space-lg)',
                                borderRadius: 'var(--radius-md)',
                                background: 'rgba(225, 112, 85, 0.1)',
                                border: '1px solid rgba(225, 112, 85, 0.3)',
                                textAlign: 'center', color: 'var(--danger)',
                                fontWeight: 600
                            }}>
                                ❌ Documents rejected — waiting for driver to re-upload
                            </div>
                        )}

                        {/* Already verified */}
                        {docModal.documentStatus === 'verified' && (
                            <div style={{
                                padding: 'var(--space-md) var(--space-lg)',
                                borderRadius: 'var(--radius-md)',
                                background: 'rgba(0, 184, 148, 0.1)',
                                border: '1px solid rgba(0, 184, 148, 0.3)',
                                textAlign: 'center', color: 'var(--success)',
                                fontWeight: 600
                            }}>
                                ✅ Documents are verified and driver is approved
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
