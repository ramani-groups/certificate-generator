const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');

class FileHandler {
  static ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  static saveFile(buffer, fileName, directory) {
    this.ensureDirectory(directory);
    const filePath = path.join(directory, fileName);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  static deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      return false;
    }
  }

  static getFileStats(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        exists: true
      };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }

  static listFiles(directory, extension = null) {
    try {
      if (!fs.existsSync(directory)) return [];

      const files = fs.readdirSync(directory);
      if (extension) {
        return files.filter(f => path.extname(f) === extension);
      }
      return files;
    } catch (error) {
      console.error(`Error listing files in ${directory}:`, error);
      return [];
    }
  }

  static createZipArchive(filePaths, outputPath, archiveName) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        resolve({
          success: true,
          path: outputPath,
          size: archive.pointer(),
          name: archiveName
        });
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      filePaths.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: path.basename(filePath) });
        }
      });

      archive.finalize();
    });
  }

  static cleanupOldFiles(directory, maxAgeHours = 24) {
    try {
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      const files = fs.readdirSync(directory);
      let deletedCount = 0;

      files.forEach(file => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtime.getTime();

        if (fileAge > maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });

      return { success: true, deletedCount };
    } catch (error) {
      console.error('Error cleaning up old files:', error);
      return { success: false, error: error.message };
    }
  }

  static copyFile(source, destination) {
    try {
      const dir = path.dirname(destination);
      this.ensureDirectory(dir);
      fs.copyFileSync(source, destination);
      return { success: true, path: destination };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static renameFile(oldPath, newPath) {
    try {
      fs.renameSync(oldPath, newPath);
      return { success: true, path: newPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static validateFileSize(fileSize, maxSizeMB = 100) {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return {
      isValid: fileSize <= maxBytes,
      maxSize: maxSizeMB,
      actualSize: (fileSize / 1024 / 1024).toFixed(2),
      message: fileSize <= maxBytes ? 'File size is valid' : `File exceeds ${maxSizeMB}MB limit`
    };
  }

  static validateFileType(fileName, allowedExtensions) {
    const ext = path.extname(fileName).toLowerCase();
    const isValid = allowedExtensions.includes(ext);
    return {
      isValid,
      extension: ext,
      allowedExtensions,
      message: isValid ? 'File type is valid' : `File type ${ext} is not allowed`
    };
  }
}

module.exports = FileHandler;
