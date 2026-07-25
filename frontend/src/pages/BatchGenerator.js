import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function BatchGenerator() {
  const [excelFiles, setExcelFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const jobCheckInterval = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Poll job status
    if (jobs.some(j => j.status === 'processing')) {
      jobCheckInterval.current = setInterval(fetchJobs, 2000);
    } else if (jobCheckInterval.current) {
      clearInterval(jobCheckInterval.current);
    }

    return () => {
      if (jobCheckInterval.current) clearInterval(jobCheckInterval.current);
    };
  }, [jobs]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [filesRes, templatesRes, jobsRes] = await Promise.all([
        axios.get('/api/uploads/excel'),
        axios.get('/api/templates'),
        axios.get('/api/batch')
      ]);

      setExcelFiles(filesRes.data.files || []);
      setTemplates(templatesRes.data.templates || []);
      setJobs(jobsRes.data.jobs || []);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/batch');
      setJobs(response.data.jobs || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  const handleGenerateBatch = async () => {
    if (!selectedFile) {
      setError('Please select an Excel file');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await axios.post('/api/batch/generate', {
        excelPath: selectedFile.path,
        templateId: selectedTemplate
      });

      if (response.data.jobId) {
        alert('✓ Batch generation started!');
        await fetchJobs();
        setSelectedFile(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start batch generation');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadBatch = async (jobId) => {
    try {
      const response = await axios.post(
        `/api/batch/download/${jobId}`,
        {},
        { responseType: 'blob' }
      );

      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificates_${jobId}.zip`;
      link.click();
    } catch (err) {
      setError('Failed to download batch');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Delete this batch job and all certificates?')) {
      try {
        await axios.delete(`/api/batch/${jobId}`);
        await fetchJobs();
      } catch (err) {
        setError('Failed to delete job');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">⚙️ Batch Certificate Generation</h2>
          <p className="card-description">Generate certificates for multiple employees at once</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="form-group">
          <label className="form-label">Select Excel File:</label>
          <select
            className="form-select"
            value={selectedFile?.path || ''}
            onChange={(e) => {
              const file = excelFiles.find(f => f.path === e.target.value);
              setSelectedFile(file);
            }}
          >
            <option value="">-- Choose a file --</option>
            {excelFiles.map((file) => (
              <option key={file.path} value={file.path}>
                {file.path.split('/').pop()} ({(file.size / 1024).toFixed(2)} KB)
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Select Template:</label>
          <select
            className="form-select"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary btn-block"
          onClick={handleGenerateBatch}
          disabled={!selectedFile || generating}
        >
          {generating ? '⏳ Generating...' : '▶ Start Batch Generation'}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Batch Jobs ({jobs.length})</h2>
        </div>

        {jobs.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '30px' }}>
            No batch jobs yet
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Results</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                    {job.id.slice(0, 12)}...
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: job.status === 'completed' ? '#d4edda' : '#fff3cd',
                      color: job.status === 'completed' ? '#155724' : '#856404'
                    }}>
                      {job.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{
                      width: '100px',
                      height: '20px',
                      background: '#f0f0f0',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div
                        style={{
                          width: `${job.progress || 0}%`,
                          height: '100%',
                          background: '#1a237e',
                          transition: 'width 0.3s'
                        }}
                      ></div>
                    </div>
                    <small>{job.progress || 0}%</small>
                  </td>
                  <td>
                    <small>
                      ✓ {job.successful} | ✕ {job.failed}
                    </small>
                  </td>
                  <td>
                    {job.status === 'completed' && (
                      <>
                        <button
                          className="btn btn-primary btn-small"
                          onClick={() => handleDownloadBatch(job.id)}
                        >
                          ⬇️ Download
                        </button>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleDeleteJob(job.id)}
                          style={{ marginLeft: '5px' }}
                        >
                          🗑️
                        </button>
                      </>
                    )}
                    {job.status === 'processing' && (
                      <span style={{ fontSize: '12px', color: '#999' }}>Processing...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📋 How Batch Generation Works</h2>
        </div>

        <ol style={{ marginLeft: '20px', lineHeight: '2' }}>
          <li>Select an Excel file with employee data</li>
          <li>Choose a certificate template design</li>
          <li>Click "Start Batch Generation"</li>
          <li>System processes each employee:
            <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
              <li>Reads data from Excel row</li>
              <li>Finds matching employee photo</li>
              <li>Applies template design</li>
              <li>Generates certificate image</li>
            </ul>
          </li>
          <li>Download all certificates as a ZIP file</li>
        </ol>
      </div>
    </div>
  );
}
