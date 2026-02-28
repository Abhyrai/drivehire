import { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { FiCamera, FiX, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

// Utility: create cropped image blob from canvas
async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.92);
    });
}

function createImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (e) => reject(e));
        img.crossOrigin = 'anonymous';
        img.src = url;
    });
}

export default function AvatarUpload({ name, currentImage, onFileSelect, size = 100, editable = true }) {
    const [preview, setPreview] = useState(null);
    const [cropSrc, setCropSrc] = useState(null); // raw image for cropper
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const fileRef = useRef();

    const initials = name
        ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // Reset input so same file can be re-selected
        e.target.value = '';

        if (!ALLOWED.includes(file.type)) {
            toast.error('Only JPG, PNG, WEBP allowed');
            return;
        }
        if (file.size > MAX_SIZE) {
            toast.error('Image must be under 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            setCropSrc(ev.target.result);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
        };
        reader.readAsDataURL(file);
    };

    const onCropComplete = useCallback((_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleCropConfirm = async () => {
        try {
            const croppedFile = await getCroppedImg(cropSrc, croppedAreaPixels);
            const previewUrl = URL.createObjectURL(croppedFile);
            setPreview(previewUrl);
            setCropSrc(null);
            if (onFileSelect) onFileSelect(croppedFile);
        } catch (err) {
            toast.error('Failed to crop image');
        }
    };

    const handleCropCancel = () => {
        setCropSrc(null);
    };

    const imageSrc = preview || currentImage;

    return (
        <>
            <div className="avatar-upload" style={{ width: size, height: size }}>
                <div className="avatar-circle" style={{ width: size, height: size, fontSize: size * 0.35 }}>
                    {imageSrc ? (
                        <img src={imageSrc} alt={name} className="avatar-img" />
                    ) : (
                        <span className="avatar-initials">{initials}</span>
                    )}
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

            {/* Crop Modal */}
            {cropSrc && (
                <div className="modal-overlay" onClick={handleCropCancel}>
                    <div className="modal-content crop-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="crop-modal-header">
                            <h3>Crop Profile Picture</h3>
                            <button className="btn btn-icon" onClick={handleCropCancel} type="button">
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="crop-container">
                            <Cropper
                                image={cropSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="round"
                                showGrid={false}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                        <div className="crop-controls">
                            <label className="text-sm text-muted">Zoom</label>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.05}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="crop-slider"
                            />
                        </div>
                        <div className="crop-actions">
                            <button className="btn btn-secondary" onClick={handleCropCancel} type="button">
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleCropConfirm} type="button">
                                <FiCheck size={16} /> Crop & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
