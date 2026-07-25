const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const CertificateProcessor = require('../processor');
const TemplateManager = require('../utils/templateManager');
const FileHandler = require('../utils/fileHandler');

const CERTIFICATES_DIR = process.env.CERTIFICATES_DIR || './backend/certificates';
const PHOTOS_DIR = process.env.PHOTOS_DIR || './backend/photos';

// GET all certificates
router.get('/', (req, res) => {
  try {
    const files = FileHandler.listFiles(CERTIFICATES_DIR, '.png');
    const certificates = files.map(file => ({
      id: file.replace('.png', ''),
      name: file,
      path: `/certificates/${file}`,
      ...FileHandler.getFileStats(path.join(CERTIFICATES_DIR, file))
    }));

    res.json({
      success: true,
      total: certificates.length,
      certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET single certificate
router.get('/:id', (req, res) => {
  try {
    const files = FileHandler.listFiles(CERTIFICATES_DIR, '.png');
    const file = files.find(f => f.includes(req.params.id));

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    const filePath = path.join(CERTIFICATES_DIR, file);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST generate single certificate
router.post('/generate', async (req, res) => {
  try {
    const { employeeData, templateId = 'default' } = req.body;

    if (!employeeData || !employeeData.employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Employee data with employeeId is required'
      });
    }

    // Load template
    const template = TemplateManager.getTemplateById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Check if photo exists
    const photoPath = path.join(PHOTOS_DIR, `${employeeData.employeeId}.jpg`);
    const photoPathPng = path.join(PHOTOS_DIR, `${employeeData.employeeId}.png`);

    let actualPhotoPath = null;
    if (fs.existsSync(photoPath)) {
      actualPhotoPath = photoPath;
    } else if (fs.existsSync(photoPathPng)) {
      actualPhotoPath = photoPathPng;
    }

    if (!actualPhotoPath) {
      return res.status(400).json({
        success: false,
        error: `Photo not found for employee ${employeeData.employeeId}`
      });
    }

    // Prepare data with photo path
    const preparedData = {
      ...employeeData,
      employeePhoto: actualPhotoPath
    };

    // Generate certificate
    const processor = new CertificateProcessor(template);
    const filename = `${employeeData.employeeId}_${(employeeData.name || 'certificate').replace(/\s+/g, '_')}.png`;
    const outputPath = path.join(CERTIFICATES_DIR, filename);

    const result = await processor.generateCertificate(preparedData, outputPath);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      certificate: {
        id: employeeData.employeeId,
        filename,
        path: `/certificates/${filename}`,
        size: result.size
      }
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE certificate
router.delete('/:id', (req, res) => {
  try {
    const files = FileHandler.listFiles(CERTIFICATES_DIR, '.png');
    const file = files.find(f => f.includes(req.params.id));

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found'
      });
    }

    const filePath = path.join(CERTIFICATES_DIR, file);
    FileHandler.deleteFile(filePath);

    res.json({
      success: true,
      message: 'Certificate deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE all certificates
router.delete('/', (req, res) => {
  try {
    const files = FileHandler.listFiles(CERTIFICATES_DIR, '.png');
    let deleted = 0;

    files.forEach(file => {
      const filePath = path.join(CERTIFICATES_DIR, file);
      if (FileHandler.deleteFile(filePath)) {
        deleted++;
      }
    });

    res.json({
      success: true,
      deleted,
      message: `${deleted} certificates deleted`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST download certificates as ZIP
router.post('/download-zip', async (req, res) => {
  try {
    const { employeeIds } = req.body;

    const files = FileHandler.listFiles(CERTIFICATES_DIR, '.png');
    const filesToZip = files
      .filter(file => !employeeIds || employeeIds.some(id => file.includes(id)))
      .map(file => path.join(CERTIFICATES_DIR, file));

    if (filesToZip.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No certificates found'
      });
    }

    const zipPath = path.join(CERTIFICATES_DIR, `certificates_${Date.now()}.zip`);
    const result = await FileHandler.createZipArchive(
      filesToZip,
      zipPath,
      'certificates.zip'
    );

    if (result.success) {
      res.download(zipPath, 'certificates.zip', (err) => {
        if (!err) FileHandler.deleteFile(zipPath);
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create ZIP'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
