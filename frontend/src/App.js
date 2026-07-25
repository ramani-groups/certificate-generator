import React, { useState } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import ExcelUpload from './pages/ExcelUpload';
import PhotoManager from './pages/PhotoManager';
import TemplateEditor from './pages/TemplateEditor';
import BatchGenerator from './pages/BatchGenerator';
import CertificateViewer from './pages/CertificateViewer';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'excel':
        return <ExcelUpload />;
      case 'photos':
        return <PhotoManager />;
      case 'templates':
        return <TemplateEditor />;
      case 'batch':
        return <BatchGenerator />;
      case 'certificates':
        return <CertificateViewer />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🎖️ Certificate Generator</h1>
          <p>Employee Award Certificate Management System</p>
        </div>
      </header>

      <nav className="app-nav">
        <ul className="nav-list">
          <li>
            <button
              className={`nav-btn ${activePage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActivePage('dashboard')}
            >
              📊 Dashboard
            </button>
          </li>
          <li>
            <button
              className={`nav-btn ${activePage === 'excel' ? 'active' : ''}`}
              onClick={() => setActivePage('excel')}
            >
              📁 Upload Excel
            </button>
          </li>
          <li>
            <button
              className={`nav-btn ${activePage === 'photos' ? 'active' : ''}`}
              onClick={() => setActivePage('photos')}
            >
              📷 Manage Photos
            </button>
          </li>
          <li>
            <button
              className={`nav-btn ${activePage === 'templates' ? 'active' : ''}`}
              onClick={() => setActivePage('templates')}
            >
              🎨 Templates
            </button>
          </li>
          <li>
            <button
              className={`nav-btn ${activePage === 'batch' ? 'active' : ''}`}
              onClick={() => setActivePage('batch')}
            >
              ⚙️ Batch Generate
            </button>
          </li>
          <li>
            <button
              className={`nav-btn ${activePage === 'certificates' ? 'active' : ''}`}
              onClick={() => setActivePage('certificates')}
            >
              🏆 View Certificates
            </button>
          </li>
        </ul>
      </nav>

      <main className="app-main">
        {renderPage()}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Employee Award Certificate Generator | Version 1.0.0</p>
      </footer>
    </div>
  );
}

export default App;
