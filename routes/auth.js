const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authcontroller = require("../controllers/auth");
const { check } = require("express-validator");

router.post(
  "/signup",
  [
    check("email").isEmail().withMessage("Invalid email address"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/, "i")
      .withMessage(
        "Password must contain at least one number, one lowercase and one uppercase letter"
      ),
  ],
  authcontroller.signUp
);
router.post("/login", authcontroller.login);
router.get("/confirmaccount/:token", authcontroller.confirmSignUp);
router.post("/forgotpasscheck", authcontroller.forgotPassCheck);
router.get("/forgotpassreset/:userId/:token", authcontroller.resetPassPage);
router.post("/newpassword", authcontroller.postPassReset);

module.exports = router;
