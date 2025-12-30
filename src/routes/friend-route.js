const express = require("express");

const authenticateMiddleware = require("../middlewares/authenticate");
const { requestFriend } = require("../controllers/friend-controller");

const router = express.Router();

router.post("/:receiverId", authenticateMiddleware, requestFriend);

module.exports = router;
