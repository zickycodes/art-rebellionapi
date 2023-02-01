const Post = require("../models/Posts");
const mongoose = require("mongoose");
const e = require("express");

const unapprovedPost = async (req, res, next) => {
  try {
    const post = await Post.find({ Approved: false });
    return res.status(200).json({
      message:
        post.length <= 0 || post === undefined || post === null
          ? "No unapproved post"
          : post,
    });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
  }
};

const approvedPost = async (req, res, next) => {
  try {
    if (req.userRole !== "admin") {
      const post = await Post.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(req.params.postid) },
        { Approved: true }
      );
      return res.status(200).json({ message: "Succesful" });
    } else {
      const err = new Error("You are not allowwd to approve this post");
      err.statusCode = 500;
      return next(err);
    }
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
  }
};

const declinePost = async (req, res, next) => {
  try {
    if (req.userRole !== "admin") {
      const post = await Post.findOneAndDelete({
        _id: mongoose.Types.ObjectId(req.params.postid),
        Approved: false,
      });
      return res.status(200).json({ message: "Succesful" });
    } else {
      const err = new Error("You are not allowed to decline this post");
      err.statusCode = 500;
      return next(err);
    }
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
  }
};
module.exports = {
  unapprovedPost,
  approvedPost,
  declinePost,
};
