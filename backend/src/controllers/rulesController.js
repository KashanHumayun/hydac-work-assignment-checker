const multer = require("multer");
const { uploadAndActivateRules, getActiveInfo } = require("../services/rulesService");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB
});

function getActiveRulesInfo(req, res, next) {
  try {
    const info = getActiveInfo();
    res.json(info);
  } catch (err) {
    next(err);
  }
}

const uploadRules = [
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded (field name must be 'file')." });
      }

      const result = await uploadAndActivateRules({
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        buffer: req.file.buffer,
      });

      res.json(result);
    } catch (err) {
      // If validation fails, previous active remains in use automatically
      res.status(400).json({
        message: err.message || "Rules upload failed.",
        details: err.details || null,
      });
    }
  },
];

module.exports = { uploadRules, getActiveRulesInfo };
