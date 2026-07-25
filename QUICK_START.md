# 🚀 Quick Start Guide

Get the Certificate Generator up and running in 5 minutes!

## 1. Clone & Setup (2 minutes)

```bash
# Clone repository
git clone https://github.com/yourusername/employee-award-certificate-generator.git
cd certificate-generator

# Install all dependencies
npm install
cd frontend && npm install && cd ..

# Copy environment file
cp .env.example .env
```

## 2. Start the Application (1 minute)

**Open Terminal 1 (Backend):**
```bash
npm start
```
Server starts on `http://localhost:5000`

**Open Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```
UI opens on `http://localhost:3000`

## 3. Prepare Your Data (1 minute)

### Create Excel File
Save as `employees.xlsx`:

```
Employee ID | Name        | Department | Title          | Award Category   | Date
001         | John Doe    | Sales      | Senior Manager | Star Performer   | 2024-01-15
002         | Jane Smith  | Marketing  | Team Lead      | Innovation Award | 2024-01-15
```

### Prepare Photos
Rename photos by Employee ID:
- `001.jpg`
- `002.jpg`

## 4. Generate Certificates (1 minute)

1. **📷 Upload Photos**: Go to "Manage Photos" → Upload 001.jpg, 002.jpg
2. **📁 Upload Excel**: Go to "Upload Excel" → Upload employees.xlsx
3. **⚙️ Batch Generate**: Go to "Batch Generate" → Start
4. **🏆 View & Download**: See results in "View Certificates"

## Done! ✅

You now have generated certificates ready to download!

---

## File Format Requirements

### Excel Columns (Minimum)
- `Employee ID` - Unique ID (matches photo names)
- `Name` - Full name
- `Department` - Team/department
- `Title` - Job position

### Photo Names
- Must match Employee ID
- Format: `{ID}.jpg` or `{ID}.png`
- Example: `001.jpg`, `002.jpg`

---

## Troubleshooting

### Port 5000 already in use?
```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>
```

### Canvas installation fails?
```bash
# macOS
brew install cairo pango libpng jpeg giflib

# Ubuntu
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev

# Then reinstall
npm install canvas
```

### Photos not found?
- Photos go in: `backend/photos/`
- Name must match Employee ID exactly
- Supported: JPG, PNG, GIF, WebP

---

## Next Steps

1. **Customize Template** → Go to "Templates" to adjust design
2. **Create More Certificates** → Upload more employee data
3. **Deploy** → See README.md for deployment options
4. **Integrate** → Use REST API for programmatic access

---

## Need Help?

- Check `README.md` for full documentation
- Review API docs in `README.md`
- Check console for error messages

**Happy generating! 🎉**
