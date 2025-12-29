const { evaluateAssignment } = require('../services/evaluationService');

function postEvaluate(req, res, next) {
  try {
    const {
      countryKey,
      typeOfActivity,
      travellerRole,
      startDate,
      endDate,
      isMobileOnly,
    } = req.body;

    if (!countryKey || !typeOfActivity || !travellerRole || !startDate || !endDate) {
      return res.status(400).json({
        message:
          'countryKey, typeOfActivity, travellerRole, startDate and endDate are required.',
      });
    }

    const result = evaluateAssignment({
      countryKey,
      typeOfActivity,
      travellerRole,
      startDate,
      endDate,
      isMobileOnly: Boolean(isMobileOnly),
    });

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { postEvaluate };
