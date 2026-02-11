const express = require("express");

const authenticateMiddleware = require("../middlewares/authenticate");
const uploadMiddleware = require("../middlewares/upload");
const {
  createPost,
  getAllPostIncludeFriendPost,
  deletePost,
} = require("../controllers/post-controller");
const { toggleLike } = require("../controllers/like-controller");

const router = express.Router();

router.post(
  "/",
  authenticateMiddleware,
  uploadMiddleware.single("image"),
  createPost
);

router.get("/friend", authenticateMiddleware, getAllPostIncludeFriendPost);

router.post("/:postId/like", authenticateMiddleware, toggleLike);

router.delete("/:postId", authenticateMiddleware, deletePost);

module.exports = router;
