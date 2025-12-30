# HYDAC Work Assignment Checker

A comprehensive web application to check EU employment notification requirements based on country-specific regulations and assignment details.

## 🎯 Features

- **Work Assignment Assessment**: Evaluate whether a planned work assignment requires EU notification
- **Country Matrix Management**: Upload and manage CSV-based country-specific rules
- **Multi-Language Support**: Full support for English and German
- **Rules Versioning**: Track and manage multiple versions of country matrices
- **PDF Export**: Generate downloadable assessment summaries
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Tech Stack

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **i18next** - Internationalization (EN/DE)
- **Webpack** - Module bundler
- **CSS3** - Styling

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **csv-parse** - CSV parsing library
- **multer** - File upload handling
- **dotenv** - Environment configuration

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/KashanHumayun/hydac-work-assignment-checker.git
cd hydac-work-assignment-checker
```

### 2. Backend Setup
```bash
cd backend
npm install
```

**Environment Variables** (create `.env` in backend folder):
```
PORT=4000
CORS_ORIGIN=*
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

## 🏃 Running the Application

### Start Backend Server
```bash
cd backend
npm start
```
Backend will run on **http://localhost:4000**

### Start Frontend Development Server
```bash
cd frontend
npm start
```
Frontend will run on **http://localhost:8081**

## 📁 Project Structure

```
HYDAC/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app configuration
│   │   ├── server.js           # Server entry point
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic
│   │   ├── data/               # Data loading & parsing
│   │   ├── utils/              # Utility functions
│   │   └── config/             # Configuration files
│   ├── data/
│   │   ├── Ländermatrix_EU-Meldungen_Stand_10-2025.csv
│   │   └── rules/              # Uploaded rule versions
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js              # Main app component
│   │   ├── index.js            # React entry point
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── api/                # API client functions
│   │   ├── i18n/               # Translations
│   │   └── styles.css          # Global styles
│   ├── public/                 # Static assets
│   ├── webpack.config.js       # Webpack configuration
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Health Check
- `GET /health` - Check if backend is running

### Country Endpoints
- `GET /api/countries` - Get list of all countries from matrix

### Evaluation Endpoints
- `POST /api/evaluate` - Evaluate a work assignment
  ```json
  {
    "country": "Germany",
    "activity": "business_meeting",
    "travellerRole": "employee",
    "startDate": "2025-01-01",
    "endDate": "2025-01-05",
    "mobileOnly": false
  }
  ```

### Rules Management Endpoints
- `GET /api/rules/active` - Get active rules version info
- `POST /api/rules/upload` - Upload new rules CSV file
  - Form data: `file` (multipart/form-data)
  - Accepts: `.csv` files
  - Max size: 6MB

## 📖 Usage

### Creating a New Assessment
1. Navigate to the home page
2. Select a country of work
3. Choose the type of activity
4. Specify traveller role and dates
5. Check "Mobile only" if applicable
6. Click "Evaluate assignment"
7. View results and download PDF if needed

### Managing Rules
1. Go to **Rules upload** (admin page)
2. View current active and latest rule versions
3. Select a CSV file with the new country matrix
4. Click "Upload rules"
5. System validates the CSV and activates it if valid
6. If validation fails, previous rules remain active

### CSV Format Requirements
- Delimiter: Semicolon (`;`)
- First row: Country headers (columns 3+)
- First column: Category names
- Second column: Subcategory names (optional)
- Remaining cells: Values for each country-category combination

## 🌍 Internationalization

The application supports English and German. Language switching is available in the top navigation bar.

### Adding New Translations
Edit the translation files in `frontend/src/i18n/locales/`:
- `en/translation.json` - English translations
- `de/translation.json` - German translations

## 🔄 Workflow

1. **Assessment Flow**:
   - User inputs assignment details
   - Backend matches against country matrix rules
   - System returns notification requirement decision
   - User can download results as PDF

2. **Rules Update Flow**:
   - Admin uploads new rules CSV
   - Backend validates CSV structure
   - If valid, new version is stored and activated
   - If invalid, system keeps previous active rules
   - All versions are versioned and tracked

## 🐛 Troubleshooting

### Backend won't start
- Ensure Node.js is installed: `node --version`
- Check if port 4000 is available
- Verify `.env` file exists in backend directory

### Frontend shows API errors
- Ensure backend is running on http://localhost:4000
- Check browser console (F12) for detailed errors
- Verify CORS configuration in backend/src/app.js

### CSV Upload fails
- Ensure CSV is formatted with semicolon delimiters
- Check that all required columns are present
- Verify file size is under 6MB

## 📝 License

This project is internal to HYDAC HR System.

## 👨‍💻 Development

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and commit: `git commit -m "Add new feature"`
3. Push to GitHub: `git push origin feature/new-feature`
4. Create a Pull Request on GitHub

### Code Style
- Use consistent indentation (2 spaces)
- Follow camelCase for variables and functions
- Add comments for complex logic

## 📞 Support

For issues or questions, please contact the HYDAC development team.

---

**Last Updated**: December 30, 2025
