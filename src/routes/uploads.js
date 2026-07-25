const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ExcelReader = require('../utils/excelReader');
const FileHandler = require('../utils/fileHandler');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_DIR = process.env.UPLOAD_DIR || './backend/uploads';
const PHOTOS_DIR = process.env.PHOTOS_DIR || './backend/photos';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    FileHandler.ensureDirectory(UPLOADS_DIR);
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${uuidv4().slice(0, 8)}`;
    cb(null, `${uniqueSuffix}_${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.xlsx', '.xls', '.csv'];
    const allowedImageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    if (req.path === '/excel') {
      if (!allowedExts.includes(ext)) {
        return cb(new Error('Only Excel files (.xlsx, .xls, .csv) are allowed'));
      }
    } else if (req.path === '/photos') {
      if (!allowedImageExts.includes(ext)) {
        return cb(new Error('Only image files are allowed'));
      }
    }

    cb(null, true);
  }
});

// POST upload Excel file
router.post('/excel', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Read Excel file
    const data = ExcelReader.readFile(req.file.path);

    // Validate required fields
    const requiredFields = ['Employee ID', 'Name', 'Department', 'Title'];
    const validation = ExcelReader.validateEmployeeData(data, requiredFields);

    res.json({
      success: validation.isValid,
      file: {
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        uploadedAt: new Date().toISOString()
      },
      validation: {
        totalRows: validation.totalRows,
        validRows: validation.validRows,
        invalidRows: validation.invalidRows,
        isValid: validation.isValid,
        errors: validation.errors
      },
      data: validation.valid
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// POST upload single photo
router.post('/photo', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No photo uploaded'
      });
    }

    const { employeeId } = req.body;

    if (!employeeId) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Employee ID is required'
      });
    }

    // Move file to photos directory with employee ID as name
    FileHandler.ensureDirectory(PHOTOS_DIR);
    const ext = path.extname(req.file.originalname).toLowerCase();
    const photoPath = path.join(PHOTOS_DIR, `${employeeId}${ext}`);

    fs.renameSync(req.file.path, photoPath);

    res.json({
      success: true,
      photo: {
        employeeId,
        filename: path.basename(photoPath),
        path: `/photos/${path.basename(photoPath)}`,
        size: req.file.size,
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    // Clean up
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST upload multiple photos (batch)
router.post('/photos-batch', upload.array('photos', 100), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No photos uploaded'
      });
    }

    FileHandler.ensureDirectory(PHOTOS_DIR);
    const results = [];
    const errors = [];

    req.files.forEach(file => {
      try {
        // Extract employee ID from filename (e.g., "001.jpg" or "001_john.jpg")
        const nameWithoutExt = path.basename(file.originalname, path.extname(file.originalname));
        const employeeId = nameWithoutExt.split('_')[0]; // Get first part before underscore

        if (!employeeId || employeeId.trim() === '') {
          fs.unlinkSync(file.path);
          errors.push({
            filename: file.originalname,
            error: 'Cannot extract employee ID from filename'
          });
          return;
        }

        const ext = path.extname(file.originalname).toLowerCase();
        const photoPath = path.join(PHOTOS_DIR, `${employeeId}${ext}`);

        fs.renameSync(file.path, photoPath);

        results.push({
          employeeId,
          filename: path.basename(photoPath),
          path: `/photos/${path.basename(photoPath)}`,
          size: file.size
        });
      } catch (err) {
        errors.push({
          filename: file.originalname,
          error: err.message
        });
      }
    });

    res.json({
      success: errors.length === 0,
      results: {
        uploaded: results.length,
        failed: errors.length,
        photos: results,
        errors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET list uploaded photos
router.get('/photos', (req, res) => {
  try {
    FileHandler.ensureDirectory(PHOTOS_DIR);
    const files = FileHandler.listFiles(PHOTOS_DIR);

    const photos = files.map(file => {
      const filePath = path.join(PHOTOS_DIR, file);
      const nameWithoutExt = path.basename(file, path.extname(file));
      return {
        employeeId: nameWithoutExt,
        filename: file,
        path: `/photos/${file}`,
        ...FileHandler.getFileStats(filePath)
      };
    });

    res.json({
      success: true,
      total: photos.length,
      photos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET list uploaded Excel files
router.get('/excel', (req, res) => {
  try {
    FileHandler.ensureDirectory(UPLOADS_DIR);
    const files = FileHandler.listFiles(UPLOADS_DIR);

    const excelFiles = files.map(file => {
      const filePath = path.join(UPLOADS_DIR, file);
      return {
        filename: file,
        path: filePath,
        ...FileHandler.getFileStats(filePath)
      };
    });

    res.json({
      success: true,
      total: excelFiles.length,
      files: excelFiles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE photo
router.delete('/photo/:employeeId', (req, res) => {
  try {
    FileHandler.ensureDirectory(PHOTOS_DIR);
    const files = FileHandler.listFiles(PHOTOS_DIR);
    const photoFile = files.find(f => {
      const nameWithoutExt = path.basename(f, path.extname(f));
      return nameWithoutExt === req.params.employeeId;
    });

    if (!photoFile) {
      return res.status(404).json({
        success: false,
        error: 'Photo not found'
      });
    }

    const photoPath = path.join(PHOTOS_DIR, photoFile);
    FileHandler.deleteFile(photoPath);

    res.json({
      success: true,
      message: 'Photo deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE Excel file
router.delete('/excel/:filename', (req, res) => {
  try {
    const filePath = path.join(UPLOADS_DIR, req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    FileHandler.deleteFile(filePath);

    res.json({
      success: true,
      message: 'File deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
