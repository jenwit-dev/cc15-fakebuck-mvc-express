const express = require("express");

const authenticateMiddleware = require("../middlewares/authenticate");
const {
  requestFriend,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  unfriend,
} = require("../controllers/friend-controller");

const router = express.Router();

router.post("/:receiverId", authenticateMiddleware, requestFriend);
router.patch("/:requesterId", authenticateMiddleware, acceptRequest);
router.delete("/:requesterId/reject", authenticateMiddleware, rejectRequest);
router.delete("/:receiverId/cancel", authenticateMiddleware, cancelRequest);
router.delete("/:friendId/unfriend", authenticateMiddleware, unfriend);

module.exports = router;
