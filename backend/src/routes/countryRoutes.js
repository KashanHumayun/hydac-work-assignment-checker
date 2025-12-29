const express = require('express');
const { getCountries } = require('../controllers/countryController');

const router = express.Router();

// GET /api/countries
router.get('/', getCountries);

module.exports = router;
