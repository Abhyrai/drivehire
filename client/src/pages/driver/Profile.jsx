import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDriverProfile, updateDriverProfile, uploadDocuments, getServerURL, uploadAvatar } from '../../services/api';
import { toast } from 'react-toastify';
import { FiUploadCloud, FiCheckCircle, FiAlertCircle, FiClock, FiXCircle, FiShield, FiUser, FiPhone, FiMapPin, FiMail, FiBriefcase } from 'react-icons/fi';
import AvatarUpload from '../../components/AvatarUpload';

export default function DriverProfilePage() {
    const { user } = useAuth();
    const [driver, setDriver] = useState(null);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(false);
    const [docForm, setDocForm] = useState({ aadhaarNumber: '', licenseNumber: '' });
    const [files, setFiles] = useState({ licenseImage: null, aadhaarImage: null });
    const [uploading, setUploading] = useState(false);
    const [pendingAvatar, setPendingAvatar] = useState(null);

    useEffect(() => { loadProfile(); }, []);

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
            setDocForm({ aadhaarNumber: d.aadhaarNumber || '', licenseNumber: d.licenseNumber || '' });
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (pendingAvatar) { await uploadAvatar(pendingAvatar); setPendingAvatar(null); }
            await updateDriverProfile({
                ...form, experience: Number(form.experience),
                vehicleTypes: [form.vehicleTypes], transmissions: [form.transmissions],
                languages: form.languages.split(',').map(l => l.trim())
            });
            toast.success('Profile updated!');
            loadProfile();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setLoading(false); }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFiles(prev => ({ ...prev, [e.target.name]: e.target.files[0] }));

    const handleDocUpload = async (e) => {
        e.preventDefault();
        if (!files.licenseImage && !files.aadhaarImage && !docForm.aadhaarNumber) {
            toast.error('Please select at least one document to upload'); return;
        }
        if (docForm.aadhaarNumber && !/^\d{12}$/.test(docForm.aadhaarNumber.replace(/\s/g, ''))) {
            toast.error('Aadhaar number must be exactly 12 digits'); return;
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
            loadProfile();
        } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
        finally { setUploading(false); }
    };

    if (!driver) return <div className="loader"><div className="spinner"></div></div>;

    const statusConfig = {
        not_uploaded: { icon: <FiAlertCircle />, label: 'Not Uploaded', color: 'var(--text-muted)', bg: 'var(--bg-secondary)' },
        pending_review: { icon: <FiClock />, label: 'Pending Review', color: 'var(--warning)', bg: 'rgba(253, 203, 110, 0.12)' },
        verified: { icon: <FiCheckCircle />, label: 'Verified', color: 'var(--success)', bg: 'rgba(0, 184, 148, 0.12)' },
        rejected: { icon: <FiXCircle />, label: 'Rejected', color: 'var(--danger)', bg: 'rgba(225, 112, 85, 0.12)' }
    };

    const docStatus = statusConfig[driver.documentStatus] || statusConfig.not_uploaded;
    const approvalBadge = driver.isApproved === 'approved' ? 'badge-success' : driver.isApproved === 'rejected' ? 'badge-danger' : 'badge-warning';

    return (
        <div className="page-content">
            {/* ── Profile Header (Centered) ── */}
            <div className="profile-hero">
                <AvatarUpload
                    name={driver.userId?.name}
                    currentImage={driver.userId?.avatar ? `${getServerURL()}${driver.userId.avatar}` : null}
                    onFileSelect={(file) => setPendingAvatar(file)}
                    editable={true}
                    size={100}
                />
                {pendingAvatar && <span className="avatar-pending-hint">📸 New photo — save to apply</span>}
                <h2 className="profile-hero-name">{user?.name}</h2>
                <div className="profile-hero-meta">
                    <span className={`badge ${approvalBadge}`}>{driver.isApproved}</span>
                    {driver.documentStatus === 'verified' && driver.isApproved === 'approved' && (
                        <span className="trust-label"><FiShield size={12} /> Verified Driver</span>
                    )}
                </div>
                <div className="profile-hero-details">
                    <span><FiMail size={13} /> {user?.email}</span>
                    <span><FiPhone size={13} /> {form.phone || 'Not set'}</span>
                    <span><FiMapPin size={13} /> {form.city || 'Not set'}</span>
                    <span><FiBriefcase size={13} /> {form.experience || 0} yrs exp</span>
                </div>
            </div>

            {/* ── Document Verification ── */}
            <div className="section-header">
                <h3>Document Verification</h3>
                <span className="badge" style={{ background: docStatus.bg, color: docStatus.color, fontSize: '11px' }}>
                    {docStatus.icon} {docStatus.label}
                </span>
            </div>

            {/* Document Previews — Side by Side */}
            {(driver.licenseImage || driver.aadhaarImage) && driver.documentStatus !== 'not_uploaded' && (
                <div className="doc-cards-row">
                    {driver.licenseImage && (
                        <div className="doc-card">
                            <div className="doc-card-img">
                                <img src={`${getServerURL()}${driver.licenseImage}`} alt="License" />
                            </div>
                            <span className="doc-card-label">Driving License</span>
                        </div>
                    )}
                    {driver.aadhaarImage && (
                        <div className="doc-card">
                            <div className="doc-card-img">
                                <img src={`${getServerURL()}${driver.aadhaarImage}`} alt="Aadhaar" />
                            </div>
                            <span className="doc-card-label">Aadhaar Card</span>
                        </div>
                    )}
                </div>
            )}

            {/* Rejection Remarks */}
            {driver.documentStatus === 'rejected' && driver.verificationRemarks && (
                <div className="alert-banner alert-danger">
                    <strong>Admin Remarks:</strong> {driver.verificationRemarks}
                </div>
            )}

            {/* Verified Timestamp */}
            {driver.documentStatus === 'verified' && driver.verifiedAt && (
                <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
                    ✅ Verified on {new Date(driver.verifiedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            )}

            {/* Upload Form */}
            {(driver.documentStatus === 'not_uploaded' || driver.documentStatus === 'rejected') && (
                <div className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
                    <form onSubmit={handleDocUpload}>
                        <div className="doc-upload-row">
                            <div className="form-group">
                                <label className="form-label">Aadhaar Number</label>
                                <input className="form-input" placeholder="1234 5678 9012"
                                    value={docForm.aadhaarNumber}
                                    onChange={(e) => setDocForm(prev => ({ ...prev, aadhaarNumber: e.target.value }))}
                                    maxLength={14} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">License Number</label>
                                <input className="form-input" placeholder="DL-1420110012345"
                                    value={docForm.licenseNumber}
                                    onChange={(e) => setDocForm(prev => ({ ...prev, licenseNumber: e.target.value }))} />
                            </div>
                        </div>
                        <div className="doc-upload-row">
                            <div className="form-group">
                                <label className="form-label">Driving License</label>
                                <div className="file-drop-zone">
                                    <input type="file" name="licenseImage" accept="image/*,.pdf"
                                        onChange={handleFileChange} style={{ display: 'none' }} id="licenseFile" />
                                    <label htmlFor="licenseFile" className="file-drop-label">
                                        <FiUploadCloud size={20} />
                                        <span>{files.licenseImage ? `✅ ${files.licenseImage.name}` : 'Tap to upload'}</span>
                                    </label>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Aadhaar Card</label>
                                <div className="file-drop-zone">
                                    <input type="file" name="aadhaarImage" accept="image/*,.pdf"
                                        onChange={handleFileChange} style={{ display: 'none' }} id="aadhaarFile" />
                                    <label htmlFor="aadhaarFile" className="file-drop-label">
                                        <FiUploadCloud size={20} />
                                        <span>{files.aadhaarImage ? `✅ ${files.aadhaarImage.name}` : 'Tap to upload'}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={uploading}>
                            {uploading ? 'Uploading...' : '📤 Upload Documents'}
                        </button>
                    </form>
                </div>
            )}

            {/* ── Edit Profile Form ── */}
            <div className="section-header">
                <h3>Edit Profile</h3>
            </div>
            <div className="glass-card">
                <form onSubmit={handleSubmit}>
                    <div className="doc-upload-row">
                        <div className="form-group"><label className="form-label">Name</label><input name="name" className="form-input" value={form.name} onChange={handleChange} required /></div>
                        <div className="form-group"><label className="form-label">Phone</label><input name="phone" className="form-input" value={form.phone} onChange={handleChange} required /></div>
                    </div>
                    <div className="doc-upload-row">
                        <div className="form-group"><label className="form-label">License Number</label><input name="licenseNumber" className="form-input" value={form.licenseNumber} onChange={handleChange} required /></div>
                        <div className="form-group"><label className="form-label">Experience (years)</label><input type="number" name="experience" className="form-input" value={form.experience} onChange={handleChange} required /></div>
                    </div>
                    <div className="doc-upload-row">
                        <div className="form-group"><label className="form-label">City</label><input name="city" className="form-input" value={form.city} onChange={handleChange} required /></div>
                        <div className="form-group"><label className="form-label">Languages</label><input name="languages" className="form-input" value={form.languages} onChange={handleChange} /></div>
                    </div>
                    <div className="doc-upload-row">
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
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Saving...' : '✅ Save Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
}
