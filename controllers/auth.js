const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const { validationResult } = require("express-validator");
const dotenv = require("dotenv");
dotenv.config();

const crypto = require("crypto");

const transporter = nodemailer.createTransport(
  // sendgridTransport({
  //   auth: {
  //     api_key:
  //       "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",
  //   },
  // })
  {
    service: "gmail",
    auth: {
      user: "godsgiftuduak2@gmail.com",
      pass: process.env.GOOGLE_PASS,
    },
  }
);

const signUp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errArray = errors.array();
      const errMessage = errArray[0].msg;
      const error = new Error(errMessage);
      error.statusCode = 422;
      return next(error);
    }

    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const err = new Error("Email already exists!");
      err.statusCode = 401;
      return next(err);
    }
    const token = crypto.randomBytes(64).toString("hex");
    const hashedPw = await bcrypt.hash(req.body.password, 12);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPw,
      confirmToken: token,
      userRole: req.body.userole,
    });
    const nUser = await newUser.save();

    await transporter.sendMail(
      {
        to: req.body.email,
        from: "godsgiftuduak2@gmail.com",
        subject: "Signup succeeded!",
        html: `<h4>You are welcome to Art & Rebellion</h4>
                <p>You are specially welcomed to Art & Rebellion where Art is the air we breathe, kindly click this <a href="http://localhost:5000/auth/confirmaccount/${token}">link</a> to confirm confirm your resgistration</p>
          `,
      },
      (err) => {
        // console.log(err);
        err.statusCode = 402;
        err.message = "Failed to connect with Email server";
        return next(err);
      }
    );

    // const user = await newUser.save();

    return res.status(200).json({
      nUser,
      Message:
        "Sign up succesful. Kindly visit your email to confirm your account",
    });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    next(e);
  }
};

const confirmSignUp = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { confirmToken: req.params.token },
      { confirmAccount: true },
      {
        new: true,
      }
    );
    // console.log(user);
    if (!user) {
      const err = new Error("Invalidated entry");
      err.statusCode = 401;
      return next(err);
    }
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    next(e);
  }
  res.status(200).json({ Message: "You are verified now!" });
};

const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      const err = new Error("Invalid username");
      err.statusCode = 400;
      return next(err);
    }
    const validated = await bcrypt.compare(req.body.password, user.password);

    if (!validated) {
      const err = new Error("Incorrect password");
      err.statusCode = 400;
      return next(err);
    }

    const token = jwt.sign(
      {
        username: user.username,
        userId: user._id,
        userRole: user.userRole,
      },
      process.env.JWT_TOKEN,
      { expiresIn: "1h" }
    );
    return res.status(200).json({ token: token, userId: user._id });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    next(e);
  }
};

const forgotPassCheck = async (req, res, next) => {
  try {
    const token = crypto.randomBytes(32).toString("hex");
    const user = await User.findOneAndUpdate(
      {
        email: req.body.email,
        confirmAccount: true,
      },
      { resetToken: token },
      {
        new: true,
      }
    );
    if (!user) {
      const err = new Error("Email does not exist");
      err.statusCode = 402;
      return next(err);
    }

    // A little nuance will be that you would send the token to the client with the client's routing address(LIKE WE HAVE BELOW). THE CLIENT WOULD RECIEVE THE TOKEN AND MAKE A POST RESQUEST TO THE BACKEND API USING THAT TOKEN
    // await transporter.sendMail(
    //   {
    //     to: req.body.email,
    //     from: "godsgiftuduak2@gmail.com",
    //     subject: "Password Reset!",
    //     html: `<p>Kindly click this <a href="http://localhost:3000/forgotpass/${token}">link</a> to reset your password</p>
    //       `,
    //   },
    //   (err) => {
    //     // console.log(err);
    //     err.statusCode = 402;
    //     err.message = "Failed to connect with Email server";
    //     return next(err);
    //   }
    // )
    await transporter.sendMail(
      {
        to: req.body.email,
        from: "godsgiftuduak2@gmail.com",
        subject: "Password Reset!",
        html: `<p>Kindly click this <a href="http://localhost:5000/auth/forgotpassreset/${user._id}/${token}">link</a> to reset your password</p>
          `,
      },
      (err) => {
        // console.log(err);
        err.statusCode = 402;
        err.message = "Failed to connect with Email server";
        return next(err);
      }
    );

    return res.status(200).json({
      message: "Kindly check your email to reset your password",
      user,
    });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    next(e);
  }
};

const resetPassPage = (req, res, next) => {
  return res.render("reset", {
    passwordToken: req.params.token,
    userId: req.params.userId,
  });
};

const postPassReset = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { resetToken: req.body.passwordToken },
      { password: await bcrypt.hash(req.body.password, 12), resetToken: null },
      {
        new: true,
      }
    );

    if (!user) {
      const err = new Error("Invalidated entry");
      err.statusCode = 401;
      return next(err);
    }
    res.status(200).json({ Message: "Password reset successfully" });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    next(e);
  }
};

module.exports = {
  signUp,
  login,
  confirmSignUp,
  forgotPassCheck,
  resetPassPage,
  postPassReset,
};
