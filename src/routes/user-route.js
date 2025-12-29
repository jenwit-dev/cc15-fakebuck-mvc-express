const express = require("express");

const {
  updateProfile,
  getUserById,
} = require("../controllers/user-controller");
const authenticateMiddleware = require("../middlewares/authenticate");
const uploadMiddleware = require("../middlewares/upload");

const router = express.Router();

router.patch(
  "/",
  authenticateMiddleware,
  // uploadMiddleware.single("qwerty"),
  // uploadMiddleware.array("qwerty"),
  uploadMiddleware.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateProfile
);

router.get("/:userId", authenticateMiddleware, getUserById);

module.exports = router;
