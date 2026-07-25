const Canvas = require('canvas');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

class CertificateProcessor {
  constructor(templateConfig) {
    this.template = templateConfig;
    this.canvas = Canvas.createCanvas(
      templateConfig.width || 1200,
      templateConfig.height || 800
    );
    this.ctx = this.canvas.getContext('2d');
  }

  async loadImage(imagePath) {
    try {
      if (!fs.existsSync(imagePath)) {
        return null;
      }
      return await Canvas.loadImage(imagePath);
    } catch (error) {
      console.error(`Failed to load image: ${imagePath}`, error);
      return null;
    }
  }

  async drawBackground() {
    const { background } = this.template;

    if (!background) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    if (background.type === 'color') {
      this.ctx.fillStyle = background.color || '#ffffff';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else if (background.type === 'image') {
      const bgImage = await this.loadImage(background.path);
      if (bgImage) {
        this.ctx.globalAlpha = background.opacity || 1;
        this.ctx.drawImage(bgImage, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalAlpha = 1;
      }
    }
  }

  async drawImage(elementKey, elementConfig) {
    if (!elementConfig) return;

    const { imagePath, x, y, width, height, borderRadius, borderColor, borderWidth } = elementConfig;

    if (!imagePath || !fs.existsSync(imagePath)) {
      return;
    }

    try {
      const image = await this.loadImage(imagePath);
      if (!image) return;

      // Draw circular/rounded image with border
      if (borderRadius && borderRadius > 0) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x + borderRadius, y + borderRadius, borderRadius, 0, Math.PI * 2);
        this.ctx.clip();
        this.ctx.drawImage(image, x, y, width || borderRadius * 2, height || borderRadius * 2);
        this.ctx.restore();

        // Draw border
        if (borderColor && borderWidth) {
          this.ctx.strokeStyle = borderColor;
          this.ctx.lineWidth = borderWidth;
          this.ctx.beginPath();
          this.ctx.arc(x + borderRadius, y + borderRadius, borderRadius, 0, Math.PI * 2);
          this.ctx.stroke();
        }
      } else {
        // Draw rectangular image
        this.ctx.drawImage(image, x, y, width, height);

        // Draw border
        if (borderColor && borderWidth) {
          this.ctx.strokeStyle = borderColor;
          this.ctx.lineWidth = borderWidth;
          this.ctx.strokeRect(x, y, width, height);
        }
      }
    } catch (error) {
      console.error(`Error drawing image ${elementKey}:`, error);
    }
  }

  async drawText(elementKey, elementConfig, value) {
    if (!elementConfig || !value) return;

    const {
      x = 0,
      y = 0,
      fontSize = 24,
      fontFamily = 'Arial',
      color = '#000000',
      fontWeight = 'normal',
      textAlign = 'center',
      maxWidth = null
    } = elementConfig;

    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = textAlign;
    this.ctx.textBaseline = 'middle';

    if (maxWidth) {
      this.ctx.fillText(String(value), x, y, maxWidth);
    } else {
      this.ctx.fillText(String(value), x, y);
    }
  }

  async drawShape(shapeConfig) {
    if (!shapeConfig) return;

    const { type, x, y, width, height, radius, color, borderColor, borderWidth } = shapeConfig;

    this.ctx.fillStyle = color || '#ffffff';
    this.ctx.strokeStyle = borderColor || color || '#000000';
    this.ctx.lineWidth = borderWidth || 1;

    switch (type) {
      case 'rect':
        if (radius) {
          this.drawRoundedRect(x, y, width, height, radius);
        } else {
          this.ctx.fillRect(x, y, width, height);
          if (borderColor) this.ctx.strokeRect(x, y, width, height);
        }
        break;
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius || width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        if (borderColor) this.ctx.stroke();
        break;
      case 'line':
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(width, height); // width/height as endpoints for lines
        this.ctx.stroke();
        break;
      default:
        break;
    }
  }

  drawRoundedRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
    if (this.ctx.strokeStyle) this.ctx.stroke();
  }

  async generateCertificate(employeeData, outputPath) {
    try {
      // Reset canvas
      this.canvas.width = this.template.width || 1200;
      this.canvas.height = this.template.height || 800;
      this.ctx = this.canvas.getContext('2d');

      // Draw background
      await this.drawBackground();

      // Draw shapes from template
      if (this.template.shapes) {
        for (const shape of this.template.shapes) {
          await this.drawShape(shape);
        }
      }

      // Draw elements from template
      if (this.template.elements) {
        for (const [key, elementConfig] of Object.entries(this.template.elements)) {
          const value = employeeData[key];

          if (elementConfig.type === 'image') {
            await this.drawImage(key, {
              ...elementConfig,
              imagePath: employeeData[key] // Direct path for photo
            });
          } else if (elementConfig.type === 'text') {
            await this.drawText(key, elementConfig, value);
          }
        }
      }

      // Save canvas to file
      const buffer = this.canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);

      return {
        success: true,
        path: outputPath,
        size: buffer.length
      };
    } catch (error) {
      console.error('Error generating certificate:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateBatch(employeeList, templateConfig, outputDir) {
    const results = {
      total: employeeList.length,
      successful: 0,
      failed: 0,
      errors: [],
      files: []
    };

    for (const employee of employeeList) {
      try {
        const filename = `${employee.employeeId}_${employee.name.replace(/\s+/g, '_')}.png`;
        const outputPath = path.join(outputDir, filename);

        const result = await this.generateCertificate(employee, outputPath);

        if (result.success) {
          results.successful++;
          results.files.push({
            employeeId: employee.employeeId,
            filename: filename,
            path: `/certificates/${filename}`,
            size: result.size
          });
        } else {
          results.failed++;
          results.errors.push({
            employeeId: employee.employeeId,
            error: result.error
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          employeeId: employee.employeeId,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = CertificateProcessor;
