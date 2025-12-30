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

### 🏠 Main Navigation Bar

The top navigation bar has 3 buttons:

1. **New assessment** - Create a new work assignment evaluation
2. **Rules upload** - Admin page to manage country matrix rules (always blue)
3. **EN/DE Toggle** - Switch between English and German languages

---

### 📋 Creating a New Assessment

#### **Step 1: Select Country**
- Click the "Country of work" dropdown
- Choose the country where the assignment will take place
- The system uses the country matrix to determine requirements

#### **Step 2: Choose Activity Type**
- **Business meetings only** - Short-term meetings with no on-site work
- **Installation / maintenance / service work** - Technical work at customer site
- **Training / workshops** - Educational activities
- **Mobile work only (home office)** - 100% remote work
- **Other** - Any other type of activity

#### **Step 3: Select Traveller Role**
- **HYDAC employee** - Direct employee
- **Contractor** - External contractor/partner
- **Trainee** - Intern or trainee
- **External service provider** - Third-party vendor

#### **Step 4: Enter Dates**
- **Start date** - When the assignment begins
- **End date** - When the assignment ends
- The system automatically calculates duration in days

#### **Step 5: Check Mobile Work (Optional)**
- Toggle "100% mobile work" if the person works entirely remotely
- The system applies special rules for pure mobile work

#### **Step 6: Click "Evaluate assignment"**
- The button shows "Evaluating..." while processing
- System checks the country matrix for this combination

---

### ✅ View Results / Assessment Summary

After evaluation, you'll see:

#### **Decision Banner** (Top of summary)
- 🟢 **Notification required** - Red banner, notification must be filed
- 🟢 **No notification required** - Green banner, no action needed
- ⚪ **Decision unclear** - Gray banner, matrix doesn't specify

#### **Basic Information Section**
Shows a summary of your inputs:
- Country
- Activity type
- Traveller role
- Duration (calculated in days)
- Mobile work status

#### **Decision Details Section**
Displays findings from the country matrix:
- **Documents to carry** - Required documents for the assignment
- **Post-stay obligations** - Actions required after the assignment ends
- **Sanctions** - Potential penalties if not compliant

#### **Buttons**
- **Download PDF** - Save results as a PDF file for records
- **New assessment** - Start another assessment

---

### 📤 Rules Upload (Admin)

#### **Overview Section**
Shows current state:
- **Active version** - Currently active rules (e.g., v1)
- **Latest version** - Most recent uploaded version

#### **Upload File**
1. Click the file input box
2. Select a `.csv` file from your computer
3. The button enables once a file is selected

#### **Upload Button**
- Click to upload the rules file
- Shows "Uploading..." while processing
- Maximum file size: 6MB

#### **Success Message** (Green banner)
- Shows: "Rules v2 uploaded successfully! (45 countries)"
- File is immediately active
- System validates before activation

#### **Error Message** (Red banner)
- Shows validation error (e.g., "Missing required columns")
- Falls back to previous version automatically
- Previous rules remain in use - no downtime

#### **Hint**
- Upload semicolon-delimited CSV
- Include all countries and categories
- Required format: See CSV section below

---

## 📊 CSV Format for Rules Upload

The country matrix CSV must follow this format:

```
;Category;;Germany;France;Italy;Spain
;Subcategory 1;Value 1;Value 2;Value 3;Value 4
Meldepflicht;Yes;Yes;No;No
;No;No;Yes;Yes
Travel Documents;Visa;Visa;Passport;Passport
;Duration;1-7 days;1-7 days;8+ days;8+ days
```

**Structure**:
- **Row 1**: Headers with country names (columns 3+)
- **Column 1**: Main category (e.g., "Meldepflicht")
- **Column 2**: Subcategory (optional, leave empty for main values)
- **Columns 3+**: Values for each country

**Example Valid CSV**:
```csv
;;Germany;France;Spain
Notification Required;Yes;Yes;No
;No;Yes;No
Travel Documents;Visa;Passport;ID
;Duration;Up to 7 days;Up to 30 days;Unlimited
Sanctions;Fine 500€;Fine 1000€;None
```

---

## 🎨 Features Breakdown

| Feature | Location | Purpose |
|---------|----------|---------|
| **Country Selection** | Home page, top field | Choose work destination |
| **Activity Dropdown** | Home page, second field | Select work type |
| **Role Selection** | Home page, third field | Identify worker type |
| **Date Pickers** | Home page, date fields | Set assignment duration |
| **Mobile Checkbox** | Home page, bottom | Mark 100% remote work |
| **Evaluate Button** | Home page, main button | Run the assessment |
| **Summary View** | Results page, full screen | Display findings |
| **PDF Download** | Results page, bottom | Export as PDF |
| **Rules Upload** | Admin page, file input | Load new matrices |
| **Version Info** | Admin page, top | Check current state |
| **Language Toggle** | Nav bar, top right | Switch EN/DE |

---

## 🔄 Workflow Examples

### Example 1: German Employee on Business Trip to France
1. Country: **France**
2. Activity: **Business meetings only**
3. Role: **HYDAC employee**
4. Duration: **3 days** (Jan 15-17)
5. Mobile: **No**

**Expected Result**: 
- ✅ Check French rules for 3-day business trips
- May require notification if >1 day
- May need visa depending on rules

### Example 2: Contractor Doing Installation in Spain
1. Country: **Spain**
2. Activity: **Installation / maintenance / service work**
3. Role: **Contractor**
4. Duration: **10 days** (Jan 1-10)
5. Mobile: **No**

**Expected Result**:
- ✅ Check Spain's rules for installation work
- Different rules apply for contractors
- Longer duration = higher compliance requirements

### Example 3: Remote Home Office from Germany
1. Country: **Any** (not applicable)
2. Activity: **Mobile work only**
3. Role: **HYDAC employee**
4. Duration: **30 days**
5. Mobile: **Yes**

**Expected Result**:
- ✅ Check home country rules (Germany)
- Pure remote work often exempt from notification
- Documents: Home office equipment list

---

## 🖼️ Adding Screenshots

To enhance documentation with screenshots, add images to `docs/images/` folder:

1. **Home Page** - Assessment form (docs/images/home-page.png)
2. **Summary Page** - Results view (docs/images/summary-page.png)
3. **Rules Admin** - CSV upload (docs/images/rules-admin.png)
4. **Mobile View** - Responsive design (docs/images/mobile-view.png)

Then reference in README with:
```markdown
![Home Page](docs/images/home-page.png)
```

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
