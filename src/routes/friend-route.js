const express = require("express");

const authenticateMiddleware = require("../middlewares/authenticate");
const {
  requestFriend,
  acceptRequest,
} = require("../controllers/friend-controller");

const router = express.Router();

router.post("/:receiverId", authenticateMiddleware, requestFriend);
router.patch("/:requesterId", authenticateMiddleware, acceptRequest);

module.exports = router;
