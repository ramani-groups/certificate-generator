const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const CertificateProcessor = require('../processor');
const TemplateManager = require('../utils/templateManager');
const FileHandler = require('../utils/fileHandler');
const ExcelReader = require('../utils/excelReader');

const CERTIFICATES_DIR = process.env.CERTIFICATES_DIR || './backend/certificates';
const PHOTOS_DIR = process.env.PHOTOS_DIR || './backend/photos';

// Store batch job status in memory (replace with DB in production)
const batchJobs = new Map();

// POST generate batch certificates from Excel
router.post('/generate', async (req, res) => {
  try {
    const { excelPath, templateId = 'default' } = req.body;

    if (!excelPath) {
      return res.status(400).json({
        success: false,
        error: 'Excel file path is required'
      });
    }

    if (!fs.existsSync(excelPath)) {
      return res.status(400).json({
        success: false,
        error: 'Excel file not found'
      });
    }

    // Create batch job ID
    const jobId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // Initialize job status
    batchJobs.set(jobId, {
      id: jobId,
      status: 'processing',
      startTime: new Date(),
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      results: [],
      errors: []
    });

    // Start processing asynchronously
    processExcelBatch(jobId, excelPath, templateId);

    res.json({
      success: true,
      jobId,
      message: 'Batch processing started'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

async function processExcelBatch(jobId, excelPath, templateId) {
  try {
    const job = batchJobs.get(jobId);

    // Read Excel file
    const data = ExcelReader.readFile(excelPath);
    job.total = data.length;

    // Validate data
    const requiredFields = ['Employee ID', 'Name', 'Department', 'Title'];
    const validation = ExcelReader.validateEmployeeData(data, requiredFields);

    if (!validation.isValid) {
      job.status = 'failed';
      job.errors = validation.errors;
      return;
    }

    // Load template
    const template = TemplateManager.getTemplateById(templateId);
    if (!template) {
      job.status = 'failed';
      job.errors.push({ message: 'Template not found' });
      return;
    }

    // Process each employee
    for (const employeeData of validation.valid) {
      try {
        // Check if photo exists
        const photoPath = findPhotoPath(employeeData.employeeId);
        if (!photoPath) {
          job.failed++;
          job.errors.push({
            employeeId: employeeData.employeeId,
            error: `Photo not found for employee ${employeeData.employeeId}`
          });
          job.processed++;
          continue;
        }

        // Prepare data
        const preparedData = {
          ...employeeData,
          employeePhoto: photoPath
        };

        // Generate certificate
        const processor = new CertificateProcessor(template);
        const filename = `${employeeData.employeeId}_${(employeeData.name || 'certificate').replace(/\s+/g, '_')}.png`;
        const outputPath = path.join(CERTIFICATES_DIR, filename);

        const result = await processor.generateCertificate(preparedData, outputPath);

        if (result.success) {
          job.successful++;
          job.results.push({
            employeeId: employeeData.employeeId,
            name: employeeData.name,
            filename,
            path: `/certificates/${filename}`,
            status: 'success'
          });
        } else {
          job.failed++;
          job.errors.push({
            employeeId: employeeData.employeeId,
            error: result.error
          });
        }

        job.processed++;
      } catch (error) {
        job.failed++;
        job.errors.push({
          employeeId: employeeData.employeeId,
          error: error.message
        });
        job.processed++;
      }
    }

    job.status = 'completed';
    job.endTime = new Date();
    job.duration = job.endTime - job.startTime;
  } catch (error) {
    const job = batchJobs.get(jobId);
    job.status = 'failed';
    job.error = error.message;
    job.endTime = new Date();
    console.error(`Batch job ${jobId} failed:`, error);
  }
}

function findPhotoPath(employeeId) {
  const photos = FileHandler.listFiles(PHOTOS_DIR);
  const photoFile = photos.find(f => {
    const nameWithoutExt = path.basename(f, path.extname(f));
    return nameWithoutExt === employeeId;
  });

  if (!photoFile) return null;
  return path.join(PHOTOS_DIR, photoFile);
}

// GET batch job status
router.get('/status/:jobId', (req, res) => {
  try {
    const job = batchJobs.get(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    const progress = job.total > 0 ? Math.round((job.processed / job.total) * 100) : 0;

    res.json({
      success: true,
      job: {
        ...job,
        progress
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET all batch jobs
router.get('/', (req, res) => {
  try {
    const jobs = Array.from(batchJobs.values()).map(job => {
      const progress = job.total > 0 ? Math.round((job.processed / job.total) * 100) : 0;
      return {
        ...job,
        progress
      };
    });

    res.json({
      success: true,
      total: jobs.length,
      jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST download batch results as ZIP
router.post('/download/:jobId', async (req, res) => {
  try {
    const job = batchJobs.get(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Batch job is still processing or failed'
      });
    }

    // Collect certificate files
    const filePaths = job.results.map(result => {
      const filePath = path.join(CERTIFICATES_DIR, result.filename);
      return filePath;
    });

    if (filePaths.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No certificates found'
      });
    }

    const zipPath = path.join(CERTIFICATES_DIR, `batch_${req.params.jobId}.zip`);
    const result = await FileHandler.createZipArchive(
      filePaths,
      zipPath,
      `certificates_${req.params.jobId}.zip`
    );

    if (result.success) {
      res.download(zipPath, result.name, (err) => {
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

// DELETE batch job
router.delete('/:jobId', (req, res) => {
  try {
    const job = batchJobs.get(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Delete associated certificates
    job.results.forEach(result => {
      const filePath = path.join(CERTIFICATES_DIR, result.filename);
      FileHandler.deleteFile(filePath);
    });

    // Remove job from memory
    batchJobs.delete(req.params.jobId);

    res.json({
      success: true,
      message: 'Batch job deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST cleanup old batch jobs
router.post('/cleanup', (req, res) => {
  try {
    const { olderThanHours = 24 } = req.body;
    const now = Date.now();
    const maxAge = olderThanHours * 60 * 60 * 1000;
    let deletedCount = 0;

    batchJobs.forEach((job, jobId) => {
      const age = now - job.startTime.getTime();
      if (age > maxAge) {
        // Delete associated certificates
        job.results.forEach(result => {
          const filePath = path.join(CERTIFICATES_DIR, result.filename);
          FileHandler.deleteFile(filePath);
        });

        batchJobs.delete(jobId);
        deletedCount++;
      }
    });

    res.json({
      success: true,
      cleaned: deletedCount,
      message: `Deleted ${deletedCount} batch jobs older than ${olderThanHours} hours`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
