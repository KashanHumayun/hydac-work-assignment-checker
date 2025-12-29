const { listCountries } = require('../services/matrixService');

function getCountries(req, res, next) {
  try {
    const countries = listCountries();
    res.json(countries);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCountries };
