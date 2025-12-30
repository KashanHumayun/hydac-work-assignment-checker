const express = require("express");
const { uploadRules, getActiveRulesInfo } = require("../controllers/rulesController");

const router = express.Router();

// GET /api/rules/active
router.get("/active", getActiveRulesInfo);

// POST /api/rules/upload  (multipart/form-data, field name: file)
router.post("/upload", uploadRules);

module.exports = router;
