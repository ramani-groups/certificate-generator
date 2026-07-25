import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TemplateEditor() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/templates');
      setTemplates(response.data.templates || []);
      if (response.data.templates && response.data.templates.length > 0) {
        setSelectedTemplate(response.data.templates[0]);
      }
    } catch (err) {
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleExportTemplate = (template) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.id}_template.json`;
    link.click();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading templates...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🎨 Certificate Templates</h2>
          <p className="card-description">View and manage certificate design templates</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {templates.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '30px' }}>
            No templates available
          </p>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Select Template:</label>
            <select
              className="form-select"
              value={selectedTemplate?.id || ''}
              onChange={(e) => {
                const template = templates.find(t => t.id === e.target.value);
                setSelectedTemplate(template);
              }}
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedTemplate && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{selectedTemplate.name}</h2>
            <p className="card-description">{selectedTemplate.description}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#1a237e', marginBottom: '10px' }}>Basic Info</h3>
            <table className="table">
              <tbody>
                <tr>
                  <td><strong>Template ID</strong></td>
                  <td>{selectedTemplate.id}</td>
                </tr>
                <tr>
                  <td><strong>Name</strong></td>
                  <td>{selectedTemplate.name}</td>
                </tr>
                <tr>
                  <td><strong>Dimensions</strong></td>
                  <td>{selectedTemplate.width}x{selectedTemplate.height}px</td>
                </tr>
                <tr>
                  <td><strong>Background</strong></td>
                  <td>{selectedTemplate.background?.type || 'None'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#1a237e', marginBottom: '10px' }}>Elements</h3>
            {selectedTemplate.elements && Object.entries(selectedTemplate.elements).length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Field Name</th>
                    <th>Type</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(selectedTemplate.elements).map(([key, element]) => (
                    <tr key={key}>
                      <td><strong>{key}</strong></td>
                      <td>{element.type}</td>
                      <td>
                        {element.type === 'text' && `Font: ${element.fontFamily}, Size: ${element.fontSize}px`}
                        {element.type === 'image' && `Position: (${element.x}, ${element.y}), Size: ${element.width}x${element.height}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#999' }}>No elements defined</p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#1a237e', marginBottom: '10px' }}>Raw JSON</h3>
            <pre style={{
              background: '#f5f5f5',
              padding: '15px',
              borderRadius: '6px',
              overflow: 'auto',
              maxHeight: '400px',
              fontSize: '12px'
            }}>
              {JSON.stringify(selectedTemplate, null, 2)}
            </pre>
          </div>

          <div>
            <button
              className="btn btn-primary"
              onClick={() => handleExportTemplate(selectedTemplate)}
            >
              ⬇️ Export Template
            </button>
            {selectedTemplate.id !== 'default' && (
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm('Delete this template?')) {
                    axios.delete(`/api/templates/${selectedTemplate.id}`)
                      .then(() => fetchTemplates())
                      .catch(err => setError('Failed to delete template'));
                  }
                }}
                style={{ marginLeft: '10px' }}
              >
                🗑️ Delete
              </button>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📋 Default Template Preview</h2>
        </div>

        <p style={{ marginBottom: '15px', color: '#666' }}>
          The default template includes:
        </p>

        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li>Dark blue background (#1a237e)</li>
          <li>Gold border frame</li>
          <li>Circular employee photo with gold border</li>
          <li>Employee name in large white text</li>
          <li>Department in gold text</li>
          <li>Award category in large gold text</li>
          <li>Award date in small gray text</li>
        </ul>

        <div style={{
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '15px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '48px', margin: '0' }}>🏆</p>
          <p style={{ margin: '10px 0' }}><strong>Star Performer Award</strong></p>
          <p style={{ margin: '5px 0', color: '#999', fontSize: '13px' }}>1200x800px | Default Design</p>
        </div>
      </div>
    </div>
  );
}
