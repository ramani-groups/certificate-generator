# 🎖️ Employee Award Certificate Generator

A complete, production-ready application for generating customizable employee award certificates from Excel data and employee photos.

## Features

✅ **Batch Certificate Generation** - Generate multiple certificates at once from Excel files
✅ **Photo Management** - Upload and organize employee photos by ID
✅ **Template System** - Create and customize certificate designs
✅ **Excel Integration** - Direct data import from Excel/CSV files
✅ **Real-time Preview** - View certificates before downloading
✅ **ZIP Download** - Download entire batches as compressed files
✅ **Responsive UI** - Works on desktop and mobile devices
✅ **REST API** - Complete API for programmatic access
✅ **Error Handling** - Comprehensive validation and error reporting

## Tech Stack

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Canvas** - Image generation
- **Sharp** - Image processing
- **XLSX** - Excel file reading
- **Multer** - File uploads

### Frontend
- **React** - UI framework
- **Axios** - HTTP client
- **CSS3** - Styling

## Project Structure

```
certificate-generator/
├── src/
│   ├── app.js                 # Main server
│   ├── processor.js           # Certificate generation logic
│   ├── routes/
│   │   ├── certificates.js    # Certificate endpoints
│   │   ├── templates.js       # Template management
│   │   ├── uploads.js         # File upload handling
│   │   └── batch.js           # Batch processing
│   └── utils/
│       ├── excelReader.js     # Excel parsing
│       ├── fileHandler.js     # File operations
│       └── templateManager.js # Template management
├── frontend/
│   ├── src/
│   │   ├── App.js             # Main React app
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── ExcelUpload.js
│   │   │   ├── PhotoManager.js
│   │   │   ├── TemplateEditor.js
│   │   │   ├── BatchGenerator.js
│   │   │   └── CertificateViewer.js
│   │   └── public/
│   └── package.json
├── backend/
│   ├── photos/                # Employee photos (by ID)
│   ├── certificates/          # Generated certificates
│   ├── templates/             # Certificate templates
│   └── uploads/               # Uploaded Excel files
├── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js 16+ and npm 8+
- Supported OS: Linux, macOS, Windows

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/employee-award-certificate-generator.git
cd certificate-generator
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

4. **Create environment file**
```bash
cp .env.example .env
```

5. **Update .env if needed**
```
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

6. **Create required directories**
```bash
mkdir -p backend/photos backend/certificates backend/templates backend/uploads
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Frontend runs on http://localhost:3000
```

Open `http://localhost:3000` in your browser.

### Production Mode

1. **Build frontend**
```bash
cd frontend
npm run build
cd ..
```

2. **Set environment**
```bash
export NODE_ENV=production
```

3. **Start server**
```bash
npm start
```

## API Documentation

### Certificates Endpoints

```
GET    /api/certificates           # List all certificates
GET    /api/certificates/:id       # Download specific certificate
POST   /api/certificates/generate  # Generate single certificate
DELETE /api/certificates/:id       # Delete certificate
DELETE /api/certificates           # Delete all certificates
POST   /api/certificates/download-zip  # Download as ZIP
```

### Templates Endpoints

```
GET    /api/templates              # List all templates
GET    /api/templates/:id          # Get template details
POST   /api/templates              # Create new template
PUT    /api/templates/:id          # Update template
DELETE /api/templates/:id          # Delete template
POST   /api/templates/:id/clone    # Clone template
GET    /api/templates/:id/export   # Export as JSON
POST   /api/templates/import/upload # Import from JSON
```

### File Upload Endpoints

```
POST   /api/uploads/excel          # Upload Excel file
POST   /api/uploads/photo          # Upload single photo
POST   /api/uploads/photos-batch   # Upload multiple photos
GET    /api/uploads/photos         # List photos
GET    /api/uploads/excel          # List Excel files
DELETE /api/uploads/photo/:id      # Delete photo
DELETE /api/uploads/excel/:filename # Delete Excel file
```

### Batch Processing Endpoints

```
POST   /api/batch/generate         # Start batch generation
GET    /api/batch                  # List batch jobs
GET    /api/batch/status/:jobId    # Get job status
POST   /api/batch/download/:jobId  # Download batch as ZIP
DELETE /api/batch/:jobId           # Delete batch job
POST   /api/batch/cleanup          # Clean up old jobs
```

## Usage Workflow

### Step 1: Prepare Employee Data

Create an Excel file with the following columns:

| Employee ID | Name | Department | Title | Award Category | Date |
|---|---|---|---|---|---|
| 001 | John Doe | Sales | Senior Manager | Star Performer | 2024-01-15 |
| 002 | Jane Smith | Marketing | Team Lead | Innovation Award | 2024-01-15 |
| 003 | Bob Johnson | IT | System Admin | Excellence Award | 2024-01-15 |

### Step 2: Upload Employee Photos

1. Go to **📷 Manage Photos**
2. Click "Add Photos"
3. Select photos (must be named by Employee ID: `001.jpg`, `002.jpg`, etc.)
4. Upload batch

### Step 3: Choose Template

1. Go to **🎨 Templates**
2. Select a template or create custom one
3. Review design and elements

### Step 4: Upload Excel File

1. Go to **📁 Upload Excel**
2. Upload your prepared Excel file
3. Verify data validation results

### Step 5: Generate Certificates

1. Go to **⚙️ Batch Generate**
2. Select Excel file and template
3. Click "Start Batch Generation"
4. Monitor progress

### Step 6: Download Results

1. Go to **🏆 View Certificates**
2. Preview individual certificates
3. Download all as ZIP or individually

## Template Customization

### Template Structure

```json
{
  "id": "template_id",
  "name": "Certificate Name",
  "description": "Description",
  "width": 1200,
  "height": 800,
  "background": {
    "type": "color",
    "color": "#ffffff"
  },
  "elements": {
    "employeeName": {
      "type": "text",
      "x": 600,
      "y": 400,
      "fontSize": 48,
      "fontFamily": "Arial",
      "color": "#000000",
      "textAlign": "center"
    },
    "employeePhoto": {
      "type": "image",
      "x": 450,
      "y": 100,
      "width": 300,
      "height": 300,
      "borderRadius": 150,
      "borderColor": "#ffd700",
      "borderWidth": 5
    }
  }
}
```

### Supported Element Types

- **text** - Text with customizable font, size, color
- **image** - Images with positioning, sizing, border options

### Customizable Properties

#### Text Elements
- `x`, `y` - Position
- `fontSize` - Font size in pixels
- `fontFamily` - Font name (Arial, Helvetica, etc.)
- `color` - Text color (hex)
- `fontWeight` - bold, normal
- `textAlign` - left, center, right
- `maxWidth` - Maximum width before wrapping

#### Image Elements
- `x`, `y` - Position
- `width`, `height` - Dimensions
- `borderRadius` - For circular images
- `borderColor` - Border color
- `borderWidth` - Border thickness

## Excel File Format

### Required Columns
- `Employee ID` - Unique identifier (matches photo filenames)
- `Name` - Employee name
- `Department` - Department name
- `Title` - Job title

### Optional Columns
- `Award Category` - Type of award
- `Date` - Award date
- Any additional custom fields

### Photo Naming Convention

Photos must be named with Employee ID:
- `001.jpg`
- `002.jpg`
- `003.png`
- etc.

Supported formats: JPG, PNG, GIF, WebP

## Deployment

### Docker Deployment

1. **Create Dockerfile** (already included)
```bash
docker build -t certificate-generator .
docker run -p 5000:3000 certificate-generator
```

### Heroku Deployment

```bash
heroku create your-app-name
git push heroku main
heroku open
```

### AWS EC2 Deployment

```bash
# SSH into instance
ssh -i key.pem ec2-user@your-instance

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone and setup
git clone your-repo
cd certificate-generator
npm install
cd frontend && npm install && npm run build
cd ..

# Start server
NODE_ENV=production npm start
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 PID
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Canvas Build Issues

**macOS:**
```bash
brew install pkg-config cairo pango libpng jpeg giflib
npm install canvas
```

**Ubuntu:**
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev
npm install canvas
```

### Memory Issues with Large Batches

Increase Node.js memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

## Performance Optimization

### For Large Batches (1000+ certificates)

1. **Increase memory:**
```bash
NODE_OPTIONS="--max-old-space-size=8192" npm start
```

2. **Use production mode:**
```bash
NODE_ENV=production npm start
```

3. **Optimize photos:**
- Resize to 300x300px
- Compress to 100KB each
- Use PNG format

4. **Database Integration** (for production):
- Store job progress in database
- Implement job queuing (Bull, BullMQ)
- Add retry mechanism

## Security Considerations

1. **File Uploads**
   - Validate file types
   - Enforce size limits
   - Scan for malware

2. **Input Validation**
   - Validate Excel data
   - Sanitize file names
   - Check Employee IDs

3. **Access Control**
   - Add authentication
   - Implement role-based access
   - Rate limiting

4. **Data Protection**
   - Encrypt sensitive data
   - HTTPS for production
   - Backup systems

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions:

1. **GitHub Issues** - Report bugs and feature requests
2. **Discussions** - Ask questions and share ideas
3. **Email** - your.email@example.com

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Core certificate generation
- Template system
- Batch processing
- REST API
- React frontend

## Roadmap

- [ ] Multi-language support
- [ ] QR code embedding
- [ ] Digital signatures
- [ ] Email distribution
- [ ] Advanced template designer
- [ ] Database backend
- [ ] User authentication
- [ ] Job scheduling
- [ ] Analytics dashboard

## Credits

Created with ❤️ for HR and People teams

---

**Happy Certificate Generating! 🎉**
