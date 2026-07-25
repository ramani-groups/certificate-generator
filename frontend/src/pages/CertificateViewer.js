import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CertificateViewer() {
  const [certificates, setCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/certificates');
      setCertificates(response.data.certificates || []);
      setError(null);
    } catch (err) {
      setError('Failed to load certificates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCertificate = async (id) => {
    if (window.confirm('Delete this certificate?')) {
      try {
        await axios.delete(`/api/certificates/${id}`);
        await fetchCertificates();
        setSelectedCert(null);
      } catch (err) {
        setError('Failed to delete certificate');
      }
    }
  };

  const handleDownloadCertificate = async (id) => {
    try {
      window.open(`http://localhost:5000/api/certificates/${id}`, '_blank');
    } catch (err) {
      setError('Failed to download certificate');
    }
  };

  const handleDownloadAll = async () => {
    try {
      const response = await axios.post(
        '/api/certificates/download-zip',
        {},
        { responseType: 'blob' }
      );

      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'all_certificates.zip';
      link.click();
    } catch (err) {
      setError('Failed to download certificates');
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Delete ALL certificates? This action cannot be undone.')) {
      try {
        await axios.delete('/api/certificates');
        await fetchCertificates();
        setSelectedCert(null);
      } catch (err) {
        setError('Failed to delete certificates');
      }
    }
  };

  const sortedCertificates = [...certificates].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'size') {
      return a.size - b.size;
    } else {
      return new Date(b.modified) - new Date(a.modified);
    }
  });

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading certificates...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🏆 View Certificates ({certificates.length})</h2>
          <p className="card-description">Browse and manage generated certificates</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {certificates.length > 0 && (
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-success"
              onClick={handleDownloadAll}
            >
              ⬇️ Download All ({certificates.length})
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDeleteAll}
            >
              🗑️ Delete All
            </button>
          </div>
        )}

        {certificates.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '30px' }}>
            No certificates generated yet
          </p>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Sort by:</label>
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Filename</option>
                <option value="size">File Size</option>
                <option value="date">Date Modified</option>
              </select>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Size</th>
                  <th>Modified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedCertificates.map((cert, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setSelectedCert(cert)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <strong>{cert.name}</strong>
                    </td>
                    <td>
                      {(cert.size / 1024).toFixed(2)} KB
                    </td>
                    <td>
                      {new Date(cert.modified).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadCertificate(cert.id);
                        }}
                      >
                        ⬇️
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCertificate(cert.id);
                        }}
                        style={{ marginLeft: '5px' }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {selectedCert && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">👁️ Preview</h2>
            <p className="card-description">{selectedCert.name}</p>
          </div>

          <div style={{
            background: '#f5f5f5',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <img
              src={`http://localhost:5000${selectedCert.path}`}
              alt={selectedCert.name}
              style={{
                maxWidth: '100%',
                maxHeight: '600px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#1a237e', marginBottom: '10px' }}>File Information</h3>
            <table className="table">
              <tbody>
                <tr>
                  <td><strong>Filename</strong></td>
                  <td>{selectedCert.name}</td>
                </tr>
                <tr>
                  <td><strong>Size</strong></td>
                  <td>{(selectedCert.size / 1024).toFixed(2)} KB</td>
                </tr>
                <tr>
                  <td><strong>Created</strong></td>
                  <td>{new Date(selectedCert.created).toLocaleString()}</td>
                </tr>
                <tr>
                  <td><strong>Modified</strong></td>
                  <td>{new Date(selectedCert.modified).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={() => handleDownloadCertificate(selectedCert.id)}
            >
              ⬇️ Download
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                handleDeleteCertificate(selectedCert.id);
                setSelectedCert(null);
              }}
            >
              🗑️ Delete
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedCert(null)}
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
