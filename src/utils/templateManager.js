const fs = require('fs');
const path = require('path');
const FileHandler = require('./fileHandler');

const TEMPLATES_DIR = process.env.TEMPLATES_DIR || './backend/templates';

class TemplateManager {
  static getDefaultTemplate() {
    return {
      id: 'default',
      name: 'Star Performer Award',
      description: 'Classic star performer certificate design',
      width: 1200,
      height: 800,
      background: {
        type: 'color',
        color: '#1a237e'
      },
      shapes: [
        {
          type: 'rect',
          x: 50,
          y: 50,
          width: 1100,
          height: 700,
          radius: 20,
          color: 'transparent',
          borderColor: '#ffd700',
          borderWidth: 3
        },
        {
          type: 'rect',
          x: 100,
          y: 300,
          width: 1000,
          height: 2,
          color: '#ffd700'
        }
      ],
      elements: {
        employeePhoto: {
          type: 'image',
          x: 450,
          y: 120,
          width: 300,
          height: 300,
          borderRadius: 150,
          borderColor: '#ffd700',
          borderWidth: 5
        },
        employeeName: {
          type: 'text',
          x: 600,
          y: 450,
          fontSize: 48,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center'
        },
        department: {
          type: 'text',
          x: 600,
          y: 520,
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#ffd700',
          textAlign: 'center'
        },
        awardCategory: {
          type: 'text',
          x: 600,
          y: 580,
          fontSize: 32,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          color: '#ffd700',
          textAlign: 'center'
        },
        date: {
          type: 'text',
          x: 600,
          y: 680,
          fontSize: 16,
          fontFamily: 'Arial',
          color: '#cccccc',
          textAlign: 'center'
        }
      }
    };
  }

  static getAllTemplates() {
    try {
      FileHandler.ensureDirectory(TEMPLATES_DIR);
      const files = FileHandler.listFiles(TEMPLATES_DIR, '.json');

      const templates = files.map(file => {
        const filePath = path.join(TEMPLATES_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
      });

      // Add default template if no templates exist
      if (templates.length === 0) {
        return [this.getDefaultTemplate()];
      }

      return templates;
    } catch (error) {
      console.error('Error loading templates:', error);
      return [this.getDefaultTemplate()];
    }
  }

  static getTemplateById(templateId) {
    if (templateId === 'default') {
      return this.getDefaultTemplate();
    }

    try {
      const filePath = path.join(TEMPLATES_DIR, `${templateId}.json`);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error loading template ${templateId}:`, error);
      return null;
    }
  }

  static createTemplate(templateData) {
    try {
      FileHandler.ensureDirectory(TEMPLATES_DIR);

      const template = {
        id: templateData.id || `template_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...templateData
      };

      const filePath = path.join(TEMPLATES_DIR, `${template.id}.json`);

      if (fs.existsSync(filePath)) {
        throw new Error('Template already exists');
      }

      fs.writeFileSync(filePath, JSON.stringify(template, null, 2));

      return {
        success: true,
        template
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static updateTemplate(templateId, updates) {
    try {
      const template = this.getTemplateById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const updated = {
        ...template,
        ...updates,
        id: templateId,
        updatedAt: new Date().toISOString()
      };

      const filePath = path.join(TEMPLATES_DIR, `${templateId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));

      return {
        success: true,
        template: updated
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static deleteTemplate(templateId) {
    try {
      if (templateId === 'default') {
        throw new Error('Cannot delete default template');
      }

      const filePath = path.join(TEMPLATES_DIR, `${templateId}.json`);
      if (!fs.existsSync(filePath)) {
        throw new Error('Template not found');
      }

      fs.unlinkSync(filePath);

      return {
        success: true,
        message: 'Template deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static cloneTemplate(sourceId, newId, newName) {
    try {
      const source = this.getTemplateById(sourceId);
      if (!source) {
        throw new Error('Source template not found');
      }

      const cloned = {
        ...source,
        id: newId,
        name: newName,
        createdAt: new Date().toISOString()
      };

      return this.createTemplate(cloned);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static validateTemplate(template) {
    const errors = [];

    if (!template.name) errors.push('Template name is required');
    if (!template.width || template.width < 100) errors.push('Valid width is required (minimum 100px)');
    if (!template.height || template.height < 100) errors.push('Valid height is required (minimum 100px)');
    if (!template.elements || Object.keys(template.elements).length === 0) {
      errors.push('At least one element is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static exportTemplate(templateId) {
    try {
      const template = this.getTemplateById(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      return {
        success: true,
        data: JSON.stringify(template, null, 2),
        filename: `${templateId}_${Date.now()}.json`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static importTemplate(jsonData) {
    try {
      const template = JSON.parse(jsonData);
      const validation = this.validateTemplate(template);

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      return this.createTemplate(template);
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = TemplateManager;
