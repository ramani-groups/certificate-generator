# 📚 API Documentation

Complete REST API reference for the Certificate Generator.

## Base URL

```
http://localhost:5000/api
```

## Health Check

**GET** `/health`

Check if server is running.

**Response:**
```json
{
  "status": "online",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

## Certificates API

### List All Certificates

**GET** `/certificates`

Get all generated certificates.

**Response:**
```json
{
  "success": true,
  "total": 5,
  "certificates": [
    {
      "id": "001_John_Doe",
      "name": "001_John_Doe.png",
      "path": "/certificates/001_John_Doe.png",
      "size": 245632,
      "created": "2024-01-15T10:30:00.000Z",
      "modified": "2024-01-15T10:30:00.000Z",
      "exists": true
    }
  ]
}
```

### Get Single Certificate

**GET** `/certificates/{id}`

Download a specific certificate.

**Parameters:**
- `id` (string) - Certificate ID or filename

**Response:** Binary PNG file

### Generate Single Certificate

**POST** `/certificates/generate`

Generate a certificate for one employee.

**Request Body:**
```json
{
  "employeeData": {
    "employeeId": "001",
    "name": "John Doe",
    "department": "Sales",
    "title": "Senior Manager",
    "awardCategory": "Star Performer",
    "date": "2024-01-15"
  },
  "templateId": "default"
}
```

**Response:**
```json
{
  "success": true,
  "certificate": {
    "id": "001",
    "filename": "001_John_Doe.png",
    "path": "/certificates/001_John_Doe.png",
    "size": 245632
  }
}
```

### Delete Certificate

**DELETE** `/certificates/{id}`

Delete a specific certificate.

**Response:**
```json
{
  "success": true,
  "message": "Certificate deleted"
}
```

### Delete All Certificates

**DELETE** `/certificates`

Delete all generated certificates.

**Response:**
```json
{
  "success": true,
  "deleted": 5,
  "message": "5 certificates deleted"
}
```

### Download as ZIP

**POST** `/certificates/download-zip`

Download selected or all certificates as ZIP.

**Request Body (Optional):**
```json
{
  "employeeIds": ["001", "002", "003"]
}
```

**Response:** Binary ZIP file

---

## Templates API

### List All Templates

**GET** `/templates`

Get all available templates.

**Response:**
```json
{
  "success": true,
  "total": 2,
  "templates": [
    {
      "id": "default",
      "name": "Star Performer Award",
      "description": "Classic design",
      "width": 1200,
      "height": 800,
      "background": {...},
      "elements": {...}
    }
  ]
}
```

### Get Single Template

**GET** `/templates/{id}`

Get template details.

**Response:**
```json
{
  "success": true,
  "template": {
    "id": "default",
    "name": "Star Performer Award",
    ...
  }
}
```

### Create Template

**POST** `/templates`

Create a new certificate template.

**Request Body:**
```json
{
  "name": "Custom Award",
  "description": "Custom design",
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
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "template": {...}
}
```

### Update Template

**PUT** `/templates/{id}`

Update existing template. (Cannot modify "default")

**Request Body:** Same as create

**Response:**
```json
{
  "success": true,
  "template": {...}
}
```

### Delete Template

**DELETE** `/templates/{id}`

Delete template. (Cannot delete "default")

**Response:**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

### Clone Template

**POST** `/templates/{id}/clone`

Create a copy of existing template.

**Request Body:**
```json
{
  "newId": "custom_award",
  "newName": "Custom Award Clone"
}
```

**Response:**
```json
{
  "success": true,
  "template": {...}
}
```

### Export Template

**GET** `/templates/{id}/export`

Export template as JSON file.

**Response:** JSON file download

### Import Template

**POST** `/templates/import/upload`

Import template from JSON.

**Request Body:**
```json
{
  "templateJson": "{...JSON string...}"
}
```

**Response:**
```json
{
  "success": true,
  "template": {...}
}
```

---

## File Upload API

### Upload Excel File

**POST** `/uploads/excel`

Upload employee data file.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (file) - Excel/CSV file

**Response:**
```json
{
  "success": true,
  "file": {
    "originalName": "employees.xlsx",
    "path": "./backend/uploads/xxx_employees.xlsx",
    "size": 5120,
    "uploadedAt": "2024-01-15T10:30:00.000Z"
  },
  "validation": {
    "totalRows": 10,
    "validRows": 10,
    "invalidRows": 0,
    "isValid": true,
    "errors": []
  },
  "data": [...]
}
```

### Upload Single Photo

**POST** `/uploads/photo`

Upload one employee photo.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `photo` (file) - Image file
- `employeeId` (string) - Employee ID

**Response:**
```json
{
  "success": true,
  "photo": {
    "employeeId": "001",
    "filename": "001.jpg",
    "path": "/photos/001.jpg",
    "size": 102400,
    "uploadedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Upload Multiple Photos

**POST** `/uploads/photos-batch`

Upload multiple employee photos at once.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `photos` (files) - Multiple image files

**Response:**
```json
{
  "success": true,
  "results": {
    "uploaded": 10,
    "failed": 0,
    "photos": [...],
    "errors": []
  }
}
```

### List Photos

**GET** `/uploads/photos`

Get all uploaded photos.

**Response:**
```json
{
  "success": true,
  "total": 10,
  "photos": [
    {
      "employeeId": "001",
      "filename": "001.jpg",
      "path": "/photos/001.jpg",
      "size": 102400,
      "created": "2024-01-15T10:30:00.000Z",
      "modified": "2024-01-15T10:30:00.000Z",
      "exists": true
    }
  ]
}
```

### List Excel Files

**GET** `/uploads/excel`

Get all uploaded Excel files.

**Response:**
```json
{
  "success": true,
  "total": 5,
  "files": [...]
}
```

### Delete Photo

**DELETE** `/uploads/photo/{employeeId}`

Delete employee photo.

**Response:**
```json
{
  "success": true,
  "message": "Photo deleted"
}
```

### Delete Excel File

**DELETE** `/uploads/excel/{filename}`

Delete Excel file.

**Response:**
```json
{
  "success": true,
  "message": "File deleted"
}
```

---

## Batch Processing API

### Start Batch Generation

**POST** `/batch/generate`

Generate certificates for all employees in Excel file.

**Request Body:**
```json
{
  "excelPath": "./backend/uploads/xxx_employees.xlsx",
  "templateId": "default"
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "batch_1705329000000_abc12345",
  "message": "Batch processing started"
}
```

### List All Batch Jobs

**GET** `/batch`

Get all batch processing jobs.

**Response:**
```json
{
  "success": true,
  "total": 5,
  "jobs": [
    {
      "id": "batch_1705329000000_abc12345",
      "status": "completed",
      "startTime": "2024-01-15T10:30:00.000Z",
      "endTime": "2024-01-15T10:31:00.000Z",
      "duration": 60000,
      "total": 10,
      "processed": 10,
      "successful": 10,
      "failed": 0,
      "progress": 100,
      "results": [...],
      "errors": []
    }
  ]
}
```

### Get Job Status

**GET** `/batch/status/{jobId}`

Get status of specific batch job.

**Response:**
```json
{
  "success": true,
  "job": {
    "id": "batch_1705329000000_abc12345",
    "status": "processing",
    "total": 100,
    "processed": 45,
    "successful": 45,
    "failed": 0,
    "progress": 45,
    "results": [...],
    "errors": []
  }
}
```

### Download Batch Results

**POST** `/batch/download/{jobId}`

Download all certificates from batch as ZIP.

**Response:** Binary ZIP file

### Delete Batch Job

**DELETE** `/batch/{jobId}`

Delete batch job and all its certificates.

**Response:**
```json
{
  "success": true,
  "message": "Batch job deleted"
}
```

### Cleanup Old Batch Jobs

**POST** `/batch/cleanup`

Delete batch jobs older than specified hours.

**Request Body (Optional):**
```json
{
  "olderThanHours": 24
}
```

**Response:**
```json
{
  "success": true,
  "cleaned": 5,
  "message": "Deleted 5 batch jobs older than 24 hours"
}
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad request
- `404` - Not found
- `500` - Server error

### Example Error Response

```json
{
  "success": false,
  "error": "Photo not found for employee 001"
}
```

---

## Rate Limiting

No rate limiting in development mode.

For production, implement:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Authentication

Currently no authentication. For production, add:

```javascript
const jwt = require('jsonwebtoken');

// Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Usage
app.use('/api/', authenticate);
```

---

## Request/Response Examples

### Example: Complete Workflow

1. **Upload Excel**
```bash
curl -F "file=@employees.xlsx" http://localhost:5000/api/uploads/excel
```

2. **Upload Photos**
```bash
curl -F "photos=@001.jpg" -F "photos=@002.jpg" \
  http://localhost:5000/api/uploads/photos-batch
```

3. **Generate Batch**
```bash
curl -X POST http://localhost:5000/api/batch/generate \
  -H "Content-Type: application/json" \
  -d '{
    "excelPath": "./backend/uploads/xxx_employees.xlsx",
    "templateId": "default"
  }'
```

4. **Check Status**
```bash
curl http://localhost:5000/api/batch/status/batch_1705329000000_abc12345
```

5. **Download Results**
```bash
curl -X POST http://localhost:5000/api/batch/download/batch_1705329000000_abc12345 \
  --output certificates.zip
```

---

**Last Updated:** January 2024
**Version:** 1.0.0
