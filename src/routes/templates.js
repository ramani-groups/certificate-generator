const express = require('express');
const router = express.Router();
const TemplateManager = require('../utils/templateManager');

// GET all templates
router.get('/', (req, res) => {
  try {
    const templates = TemplateManager.getAllTemplates();
    res.json({
      success: true,
      total: templates.length,
      templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET single template
router.get('/:id', (req, res) => {
  try {
    const template = TemplateManager.getTemplateById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST create template
router.post('/', (req, res) => {
  try {
    const validation = TemplateManager.validateTemplate(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const result = TemplateManager.createTemplate(req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      template: result.template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT update template
router.put('/:id', (req, res) => {
  try {
    if (req.params.id === 'default') {
      return res.status(403).json({
        success: false,
        error: 'Cannot modify default template'
      });
    }

    const result = TemplateManager.updateTemplate(req.params.id, req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      template: result.template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE template
router.delete('/:id', (req, res) => {
  try {
    const result = TemplateManager.deleteTemplate(req.params.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST clone template
router.post('/:id/clone', (req, res) => {
  try {
    const { newId, newName } = req.body;

    if (!newId || !newName) {
      return res.status(400).json({
        success: false,
        error: 'newId and newName are required'
      });
    }

    const result = TemplateManager.cloneTemplate(req.params.id, newId, newName);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      template: result.template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST export template
router.get('/:id/export', (req, res) => {
  try {
    const result = TemplateManager.exportTemplate(req.params.id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${result.filename}`);
    res.send(result.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST import template
router.post('/import/upload', (req, res) => {
  try {
    const { templateJson } = req.body;

    if (!templateJson) {
      return res.status(400).json({
        success: false,
        error: 'Template JSON is required'
      });
    }

    const result = TemplateManager.importTemplate(templateJson);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      template: result.template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
