const express = require("express");

const { updateProfile } = require("../controllers/user-controller");
const authenticateMiddleware = require("../middlewares/authenticate");
const uploadMiddleware = require("../middlewares/upload");

const router = express.Router();

router.patch(
  "/",
  authenticateMiddleware,
  uploadMiddleware.single("qwerty"),
  updateProfile
);

module.exports = router;
