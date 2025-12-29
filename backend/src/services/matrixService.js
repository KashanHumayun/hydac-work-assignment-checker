const { getMatrix } = require('../data/matrixLoader');

function listCountries() {
  const { countries } = getMatrix();
  return countries;
}

function getCountryData(countryKey) {
  const { data } = getMatrix();
  return data[countryKey] || null;
}

module.exports = { listCountries, getCountryData };
