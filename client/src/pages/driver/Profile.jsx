import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDriverProfile, updateDriverProfile, uploadDocuments, getServerURL, uploadAvatar } from '../../services/api';
import { toast } from 'react-toastify';
import { FiUploadCloud, FiCheckCircle, FiAlertCircle, FiClock, FiXCircle, FiShield } from 'react-icons/fi';
import AvatarUpload from '../../components/AvatarUpload';

export default function DriverProfilePage() {
    const { user } = useAuth();
    const [driver, setDriver] = useState(null);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(false);

    // Document upload state
    const [docForm, setDocForm] = useState({ aadhaarNumber: '', licenseNumber: '' });
    const [files, setFiles] = useState({ licenseImage: null, aadhaarImage: null });
    const [uploading, setUploading] = useState(false);
    const [pendingAvatar, setPendingAvatar] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await getDriverProfile();
            const d = res.data.driver;
            setDriver(d);
            setForm({
                name: d.userId?.name || '', phone: d.userId?.phone || '',
                licenseNumber: d.licenseNumber, experience: d.experience,
                city: d.city, languages: d.languages?.join(', '),
                vehicleTypes: d.vehicleTypes?.[0] || 'car',
                transmissions: d.transmissions?.[0] || 'manual'
            });
            setDocForm({
                aadhaarNumber: d.aadhaarNumber || '',
                licenseNumber: d.licenseNumber || ''
            });
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (pendingAvatar) {
                await uploadAvatar(pendingAvatar);
                setPendingAvatar(null);
            }
            await updateDriverProfile({
                ...form,
                experience: Number(form.experience),
                vehicleTypes: [form.vehicleTypes],
                transmissions: [form.transmissions],
                languages: form.languages.split(',').map(l => l.trim())
            });
            toast.success('Profile updated!');
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setLoading(false); }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        setFiles(prev => ({ ...prev, [e.target.name]: e.target.files[0] }));
    };

    const handleDocUpload = async (e) => {
        e.preventDefault();

        if (!files.licenseImage && !files.aadhaarImage && !docForm.aadhaarNumber) {
            toast.error('Please select at least one document to upload');
            return;
        }

        // Validate Aadhaar number
        if (docForm.aadhaarNumber && !/^\d{12}$/.test(docForm.aadhaarNumber.replace(/\s/g, ''))) {
            toast.error('Aadhaar number must be exactly 12 digits');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            if (files.licenseImage) formData.append('licenseImage', files.licenseImage);
            if (files.aadhaarImage) formData.append('aadhaarImage', files.aadhaarImage);
            if (docForm.aadhaarNumber) formData.append('aadhaarNumber', docForm.aadhaarNumber.replace(/\s/g, ''));
            if (docForm.licenseNumber) formData.append('licenseNumber', docForm.licenseNumber);

            await uploadDocuments(formData);
            toast.success('Documents uploaded! Pending admin review.');
            setFiles({ licenseImage: null, aadhaarImage: null });
            loadProfile(); // refresh
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally { setUploading(false); }
    };

    if (!driver) return <div className="loader"><div className="spinner"></div></div>;

    const statusConfig = {
        not_uploaded: { icon: <FiAlertCircle />, label: 'Not Uploaded', color: 'var(--text-muted)', bg: 'var(--bg-secondary)', desc: 'Please upload your Aadhaar card and driving license to get verified.' },
        pending_review: { icon: <FiClock />, label: 'Pending Review', color: 'var(--warning)', bg: 'rgba(253, 203, 110, 0.12)', desc: 'Your documents are being reviewed by admin. You will be notified once verified.' },
        verified: { icon: <FiCheckCircle />, label: 'Verified', color: 'var(--success)', bg: 'rgba(0, 184, 148, 0.12)', desc: 'Your documents are verified! You can now go online and accept jobs.' },
        rejected: { icon: <FiXCircle />, label: 'Rejected', color: 'var(--danger)', bg: 'rgba(225, 112, 85, 0.12)', desc: 'Your documents were rejected. Please re-upload with correct documents.' }
    };

    const docStatus = statusConfig[driver.documentStatus] || statusConfig.not_uploaded;

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
                    <AvatarUpload
                        name={driver.userId?.name}
                        currentImage={driver.userId?.avatar ? `${getServerURL()}${driver.userId.avatar}` : null}
                        onFileSelect={(file) => setPendingAvatar(file)}
                        editable={true}
                        size={70}
                    />
                    {pendingAvatar && <span style={{ fontSize: 'var(--font-xs)', color: 'var(--warning)' }}>📸 New photo — save to apply</span>}
                    <div>
                        <h1 style={{ margin: 0 }}>My Profile 👤</h1>
                        <p style={{ margin: '4px 0 0' }}>Update your driver profile and verify documents</p>
                        {driver.documentStatus === 'verified' && driver.isApproved && (
                            <span className="trust-label" style={{ marginTop: 8 }}><FiShield size={12} /> Verified Driver</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Document Verification Section */}
            <div className="glass-card" style={{ maxWidth: 700, marginBottom: 'var(--space-xl)' }}>
                <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📋 Document Verification
                </h3>

                {/* Status Banner */}
                <div style={{
                    padding: 'var(--space-md) var(--space-lg)',
                    borderRadius: 'var(--radius-md)',
                    background: docStatus.bg,
                    border: `1px solid ${docStatus.color}33`,
                    display: 'flex', gap: 'var(--space-md)', alignItems: 'center',
                    marginBottom: 'var(--space-lg)'
                }}>
                    <div style={{ fontSize: '1.5rem', color: docStatus.color }}>{docStatus.icon}</div>
                    <div>
                        <strong style={{ color: docStatus.color }}>{docStatus.label}</strong>
                        <p className="text-sm" style={{ margin: 0, opacity: 0.8 }}>{docStatus.desc}</p>
                    </div>
                </div>

                {/* Show rejection remarks */}
                {driver.documentStatus === 'rejected' && driver.verificationRemarks && (
                    <div style={{
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(225, 112, 85, 0.08)',
                        border: '1px solid rgba(225, 112, 85, 0.2)',
                        marginBottom: 'var(--space-lg)',
                        fontSize: 'var(--font-sm)'
                    }}>
                        <strong style={{ color: 'var(--danger)' }}>Admin Remarks:</strong>
                        <p style={{ margin: '4px 0 0' }}>{driver.verificationRemarks}</p>
                    </div>
                )}

                {/* Uploaded Document Preview */}
                {(driver.licenseImage || driver.aadhaarImage) && driver.documentStatus !== 'not_uploaded' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                        {driver.licenseImage && (
                            <div style={{ textAlign: 'center' }}>
                                <p className="text-sm text-muted" style={{ marginBottom: '0.25rem' }}>Driving License</p>
                                <div style={{
                                    borderRadius: 'var(--radius-md)', overflow: 'hidden',
                                    border: '1px solid var(--border)', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'var(--bg-secondary)'
                                }}>
                                    <img src={`${getServerURL()}${driver.licenseImage}`} alt="License" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                </div>
                            </div>
                        )}
                        {driver.aadhaarImage && (
                            <div style={{ textAlign: 'center' }}>
                                <p className="text-sm text-muted" style={{ marginBottom: '0.25rem' }}>Aadhaar Card</p>
                                <div style={{
                                    borderRadius: 'var(--radius-md)', overflow: 'hidden',
                                    border: '1px solid var(--border)', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'var(--bg-secondary)'
                                }}>
                                    <img src={`${getServerURL()}${driver.aadhaarImage}`} alt="Aadhaar" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Upload Form — show if not_uploaded or rejected */}
                {(driver.documentStatus === 'not_uploaded' || driver.documentStatus === 'rejected') && (
                    <form onSubmit={handleDocUpload}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Aadhaar Number</label>
                                <input
                                    className="form-input" placeholder="1234 5678 9012"
                                    value={docForm.aadhaarNumber}
                                    onChange={(e) => setDocForm(prev => ({ ...prev, aadhaarNumber: e.target.value }))}
                                    maxLength={14}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">License Number</label>
                                <input
                                    className="form-input" placeholder="DL-1420110012345"
                                    value={docForm.licenseNumber}
                                    onChange={(e) => setDocForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Driving License (Image/PDF)</label>
                                <div style={{
                                    border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)',
                                    padding: 'var(--space-lg)', textAlign: 'center', cursor: 'pointer',
                                    background: files.licenseImage ? 'rgba(0,184,148,0.05)' : 'transparent',
                                    transition: 'all 0.2s'
                                }}>
                                    <input type="file" name="licenseImage" accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }} id="licenseFile" />
                                    <label htmlFor="licenseFile" style={{ cursor: 'pointer' }}>
                                        <FiUploadCloud style={{ fontSize: '1.5rem', color: 'var(--primary)', display: 'block', margin: '0 auto 0.25rem' }} />
                                        <span className="text-sm">{files.licenseImage ? `✅ ${files.licenseImage.name}` : 'Click to upload'}</span>
                                    </label>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Aadhaar Card (Image/PDF)</label>
                                <div style={{
                                    border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)',
                                    padding: 'var(--space-lg)', textAlign: 'center', cursor: 'pointer',
                                    background: files.aadhaarImage ? 'rgba(0,184,148,0.05)' : 'transparent',
                                    transition: 'all 0.2s'
                                }}>
                                    <input type="file" name="aadhaarImage" accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }} id="aadhaarFile" />
                                    <label htmlFor="aadhaarFile" style={{ cursor: 'pointer' }}>
                                        <FiUploadCloud style={{ fontSize: '1.5rem', color: 'var(--primary)', display: 'block', margin: '0 auto 0.25rem' }} />
                                        <span className="text-sm">{files.aadhaarImage ? `✅ ${files.aadhaarImage.name}` : 'Click to upload'}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary w-full" disabled={uploading} style={{ marginTop: 'var(--space-md)' }}>
                            {uploading ? 'Uploading...' : '📤 Upload Documents for Verification'}
                        </button>
                    </form>
                )}

                {/* Verified badge with timestamp */}
                {driver.documentStatus === 'verified' && driver.verifiedAt && (
                    <p className="text-sm text-muted" style={{ marginTop: 'var(--space-sm)' }}>
                        ✅ Verified on {new Date(driver.verifiedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                )}
            </div>

            {/* Profile Info Section */}
            <div className="glass-card" style={{ maxWidth: 700 }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                    <div className="driver-avatar" style={{ width: 80, height: 80, fontSize: 'var(--font-2xl)', margin: '0 auto' }}>
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <h3 style={{ marginTop: 'var(--space-sm)' }}>{user?.name}</h3>
                    <span className={`badge ${driver.isApproved === 'approved' ? 'badge-success' : driver.isApproved === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {driver.isApproved}
                    </span>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">Name</label><input name="name" className="form-input" value={form.name} onChange={handleChange} required /></div>
                        <div className="form-group"><label className="form-label">Phone</label><input name="phone" className="form-input" value={form.phone} onChange={handleChange} required /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">License Number</label><input name="licenseNumber" className="form-input" value={form.licenseNumber} onChange={handleChange} required /></div>
                        <div className="form-group"><label className="form-label">Experience (years)</label><input type="number" name="experience" className="form-input" value={form.experience} onChange={handleChange} required /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group"><label className="form-label">City</label><input name="city" className="form-input" value={form.city} onChange={handleChange} required /></div>
                        <div className="form-group"><label className="form-label">Languages</label><input name="languages" className="form-input" value={form.languages} onChange={handleChange} /></div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Vehicle Type</label>
                            <select name="vehicleTypes" className="form-select" value={form.vehicleTypes} onChange={handleChange}>
                                <option value="car">Car</option><option value="bike">Bike</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Transmission</label>
                            <select name="transmissions" className="form-select" value={form.transmissions} onChange={handleChange}>
                                <option value="manual">Manual</option><option value="automatic">Automatic</option><option value="both">Both</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
                </form>
            </div>
        </div>
    );
}
