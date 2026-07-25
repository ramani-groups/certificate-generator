import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function PhotoManager() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/uploads/photos');
      setPhotos(response.data.photos || []);
      setError(null);
    } catch (err) {
      setError('Failed to load photos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleFiles = async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }

    try {
      const response = await axios.post('/api/uploads/photos-batch', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.results.photos.length > 0) {
        await fetchPhotos();
        alert(`✓ Successfully uploaded ${response.data.results.uploaded} photos`);
      }

      if (response.data.results.errors.length > 0) {
        alert(`⚠ ${response.data.results.errors.length} photos failed to upload`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (employeeId) => {
    if (window.confirm(`Delete photo for employee ${employeeId}?`)) {
      try {
        await axios.delete(`/api/uploads/photo/${employeeId}`);
        await fetchPhotos();
      } catch (err) {
        setError('Failed to delete photo');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading photos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📷 Manage Employee Photos</h2>
          <p className="card-description">Upload and manage employee photos for certificates</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button
          className="btn btn-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? '⏳ Uploading...' : '+ Add Photos'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleMultipleFiles}
          style={{ display: 'none' }}
        />

        <div style={{ marginTop: '10px' }}>
          <p style={{ fontSize: '13px', color: '#999' }}>
            💡 Tip: Name files by Employee ID (e.g., 001.jpg, 002.jpg)
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Uploaded Photos ({photos.length})</h2>
        </div>

        {photos.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '30px' }}>
            No photos uploaded yet
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '15px'
          }}>
            {photos.map((photo, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  textAlign: 'center'
                }}
              >
                <img
                  src={`http://localhost:5000${photo.path}`}
                  alt={photo.employeeId}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                <div style={{ padding: '10px' }}>
                  <p style={{
                    margin: '5px 0',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    ID: {photo.employeeId}
                  </p>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleDeletePhoto(photo.employeeId)}
                    style={{ width: '100%', marginTop: '8px' }}
                  >
                    ✕ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">ℹ️ Guidelines</h2>
        </div>

        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li><strong>Naming Convention:</strong> Name photos by Employee ID (001.jpg, 002.jpg)</li>
          <li><strong>Supported Formats:</strong> JPG, PNG, GIF, WebP</li>
          <li><strong>Recommended Size:</strong> 300x300px (square format)</li>
          <li><strong>File Size:</strong> Keep each photo under 5MB</li>
          <li><strong>Quality:</strong> Use high-quality images for best results</li>
        </ul>
      </div>
    </div>
  );
}
