import { useState, useRef } from 'react';
import { FiCamera } from 'react-icons/fi';
import { toast } from 'react-toastify';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export default function AvatarUpload({ name, currentImage, onUpload, size = 100, editable = true }) {
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef();

    const initials = name
        ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!ALLOWED.includes(file.type)) {
            toast.error('Only JPG, PNG, WEBP allowed');
            return;
        }
        if (file.size > MAX_SIZE) {
            toast.error('Image must be under 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target.result);
        reader.readAsDataURL(file);

        if (onUpload) {
            setUploading(true);
            // Client-side only — pass file to parent
            onUpload(file).finally?.(() => setUploading(false));
        }
    };

    const imageSrc = preview || currentImage;

    return (
        <div className="avatar-upload" style={{ width: size, height: size }}>
            <div className="avatar-circle" style={{ width: size, height: size, fontSize: size * 0.35 }}>
                {imageSrc ? (
                    <img src={imageSrc} alt={name} className="avatar-img" />
                ) : (
                    <span className="avatar-initials">{initials}</span>
                )}
                {uploading && <div className="avatar-loading">⏳</div>}
            </div>
            {editable && (
                <>
                    <button
                        className="avatar-edit-btn"
                        onClick={() => fileRef.current?.click()}
                        aria-label="Change photo"
                        type="button"
                    >
                        <FiCamera size={14} />
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFile}
                        style={{ display: 'none' }}
                    />
                </>
            )}
        </div>
    );
}
