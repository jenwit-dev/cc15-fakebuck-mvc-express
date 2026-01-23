const express = require("express");

const authenticateMiddleware = require("../middlewares/authenticate");
const uploadMiddleware = require("../middlewares/upload");
const {
  createPost,
  getAllPostIncludeFriendPost,
} = require("../controllers/post-controller");

const router = express.Router();

router.post(
  "/",
  authenticateMiddleware,
  uploadMiddleware.single("image"),
  createPost
);

router.get("/friend", authenticateMiddleware, getAllPostIncludeFriendPost);

module.exports = router;
