import React, { useState, useRef } from 'react';
import axios from 'axios';

export default function ExcelUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/uploads/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(response.data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📁 Upload Excel File</h2>
          <p className="card-description">Upload employee data (Excel, CSV format)</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div
          className="upload-area"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon">📄</div>
          <p className="upload-text">
            {file ? file.name : 'Drag and drop Excel file here'}
          </p>
          <p className="upload-hint">or click to select file</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {file && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? '⏳ Uploading...' : '✓ Upload File'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              disabled={loading}
              style={{ marginLeft: '10px' }}
            >
              ✕ Clear
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📊 Upload Results</h2>
          </div>

          {result.validation.isValid ? (
            <div className="alert alert-success">
              ✓ All {result.validation.validRows} rows are valid!
            </div>
          ) : (
            <div className="alert alert-warning">
              ⚠ {result.validation.invalidRows} rows have issues
            </div>
          )}

          <div className="grid">
            <div className="grid-item">
              <div className="number">{result.validation.totalRows}</div>
              <h3>Total Rows</h3>
            </div>
            <div className="grid-item">
              <div className="number" style={{ color: '#28a745' }}>
                {result.validation.validRows}
              </div>
              <h3>Valid Rows</h3>
            </div>
            <div className="grid-item">
              <div className="number" style={{ color: '#dc3545' }}>
                {result.validation.invalidRows}
              </div>
              <h3>Invalid Rows</h3>
            </div>
          </div>

          {result.validation.errors.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>Errors:</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {result.validation.errors.map((err, idx) => (
                    <tr key={idx}>
                      <td>{err.row}</td>
                      <td>{err.errors.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.data.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>Sample Data:</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Title</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.slice(0, 5).map((row, idx) => (
                    <tr key={idx}>
                      <td>{row['Employee ID']}</td>
                      <td>{row['Name']}</td>
                      <td>{row['Department']}</td>
                      <td>{row['Title']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📝 File Format Requirements</h2>
        </div>

        <h3 style={{ marginTop: '15px', color: '#1a237e' }}>Required Columns:</h3>
        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li><strong>Employee ID</strong> - Unique identifier (matches photo filenames)</li>
          <li><strong>Name</strong> - Full name of employee</li>
          <li><strong>Department</strong> - Department or team</li>
          <li><strong>Title</strong> - Job title or position</li>
          <li><strong>Award Category</strong> (Optional) - Type of award</li>
          <li><strong>Date</strong> (Optional) - Award date</li>
        </ul>

        <h3 style={{ marginTop: '15px', color: '#1a237e' }}>Example:</h3>
        <pre style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '6px',
          overflow: 'auto',
          marginTop: '10px'
        }}>
{`Employee ID | Name        | Department | Title            | Award Category      | Date
001         | John Doe    | Sales      | Senior Manager   | Star Performer      | 2024-01-15
002         | Jane Smith  | Marketing  | Team Lead        | Innovation Award    | 2024-01-15
003         | Bob Johnson | IT         | System Admin     | Excellence Award    | 2024-01-15`}
        </pre>
      </div>
    </div>
  );
}
