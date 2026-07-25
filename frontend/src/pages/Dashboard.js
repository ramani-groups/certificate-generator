import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [stats, setStats] = useState({
    certificates: 0,
    photos: 0,
    templates: 0,
    batchJobs: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [certRes, photosRes, templatesRes, batchRes] = await Promise.all([
        axios.get('/api/certificates'),
        axios.get('/api/uploads/photos'),
        axios.get('/api/templates'),
        axios.get('/api/batch')
      ]);

      setStats({
        certificates: certRes.data.total || 0,
        photos: photosRes.data.total || 0,
        templates: templatesRes.data.total || 0,
        batchJobs: batchRes.data.total || 0
      });
      setError(null);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Dashboard Overview</h2>
          <p className="card-description">System statistics and quick actions</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="grid">
          <div className="grid-item">
            <div className="number">{stats.certificates}</div>
            <h3>Generated Certificates</h3>
            <p>PNG files ready for download</p>
          </div>

          <div className="grid-item">
            <div className="number">{stats.photos}</div>
            <h3>Employee Photos</h3>
            <p>Uploaded and indexed</p>
          </div>

          <div className="grid-item">
            <div className="number">{stats.templates}</div>
            <h3>Certificate Templates</h3>
            <p>Available designs</p>
          </div>

          <div className="grid-item">
            <div className="number">{stats.batchJobs}</div>
            <h3>Batch Jobs</h3>
            <p>Processing history</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🚀 Quick Start Guide</h2>
        </div>

        <div style={{ lineHeight: '1.8' }}>
          <h3 style={{ marginTop: '20px', color: '#1a237e' }}>Step 1: Prepare Your Data</h3>
          <p>Create an Excel file with columns: Employee ID, Name, Department, Title, Award Category, Date</p>

          <h3 style={{ marginTop: '20px', color: '#1a237e' }}>Step 2: Upload Employee Photos</h3>
          <p>Upload photos named with Employee ID (e.g., 001.jpg, 002.jpg)</p>

          <h3 style={{ marginTop: '20px', color: '#1a237e' }}>Step 3: Choose or Create Template</h3>
          <p>Select from existing templates or design your own with custom colors and fonts</p>

          <h3 style={{ marginTop: '20px', color: '#1a237e' }}>Step 4: Upload Excel File</h3>
          <p>Upload your Excel file with employee data</p>

          <h3 style={{ marginTop: '20px', color: '#1a237e' }}>Step 5: Generate Certificates</h3>
          <p>Run batch generation to create all certificates at once</p>

          <h3 style={{ marginTop: '20px', color: '#1a237e' }}>Step 6: Download Results</h3>
          <p>Download individual certificates or entire batch as ZIP</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">ℹ️ System Information</h2>
        </div>

        <table className="table">
          <tbody>
            <tr>
              <td><strong>Application</strong></td>
              <td>Employee Award Certificate Generator</td>
            </tr>
            <tr>
              <td><strong>Version</strong></td>
              <td>1.0.0</td>
            </tr>
            <tr>
              <td><strong>Status</strong></td>
              <td>✅ Online</td>
            </tr>
            <tr>
              <td><strong>API Endpoint</strong></td>
              <td>http://localhost:5000/api</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
