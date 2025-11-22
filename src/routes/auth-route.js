const express = require("express");

// P Earth likes to use authController variable instead of destructuring right away at the top when Name Export 2
// const authController = require("../controllers/auth-controller");

// Name Export 2 destructuring the exported object right away
const { register, login } = require("../controllers/auth-controller");

const router = express.Router();

// Name Export 2 using authController variable according to P Earth, you have to write authController dot many times
// router.post("/register", authController.register);
// router.post("/login", authController.login);

// but if you destructure right away at the top so we can use fn register and login directly
router.post("/register", register);
router.post("/login", login);

module.exports = router;
