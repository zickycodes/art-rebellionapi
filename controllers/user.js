const Post = require("../models/Posts");
const path = require("path");
const fs = require("fs");
const { validationResult } = require("express-validator");
const Like = require("../models/Like");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const Comments = require("../models/Comment");

const clearImage = (filePath) => {
  if (filePath === null) {
    return;
  }
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ Approved: true }).populate("comments");

    return res.status(200).json({ message: "Here you go!", posts });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
  }
};

const getPost = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      Approved: true,
      _id: mongoose.Types.ObjectId(req.params.postid),
    }).populate("comments");

    // console.log(post);
    return res.status(200).json({ message: "Here you go!", post });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
  }
};

const createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errArray = errors.array();
      const errMessage = errArray[0].msg;
      const error = new Error(errMessage);
      error.statusCode = 422;
      clearImage(req.file === undefined || null ? null : req.file.path);
      return next(error);
    }

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      Author: req.userId,
      photo: req.file ? req.file.path : null,
      categories: [req.body.category],
    });

    post.save();

    return res.status(200).json({ message: "Post created" });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    clearImage(req.file === undefined || null ? null : req.file.path);
    next(e);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
      Author: mongoose.Types.ObjectId(req.userId),
    });

    if (post) {
      if (!req.file) {
        await Post.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(req.params.id),
            Author: mongoose.Types.ObjectId(req.userId),
          },
          { ...req.body },
          {
            new: true,
          }
        );
        return res
          .status(200)
          .json({ message: "Post Updated without new photo" });
      } else {
        await Post.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(req.params.id),
            Author: mongoose.Types.ObjectId(req.userId),
          },
          { ...req.body, photo: req.file.path },
          {
            new: true,
          }
        );
        clearImage(post.photo ? post.photo : null);
        return res.status(200).json({ message: "Post Updated with new photo" });
      }
    } else {
      const err = new Error("You are not allowed to update this post");
      err.statusCode = 402;
      clearImage(req.file ? req.file.path : null);
      return next(err);
    }
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: mongoose.Types.ObjectId(req.params.id),
      Author: mongoose.Types.ObjectId(req.userId),
    });
    if (post || req.userRole) {
      clearImage(post.photo ? post.photo : null);
      await Post.findOneAndDelete({
        _id: mongoose.Types.ObjectId(req.params.id),
        Author: mongoose.Types.ObjectId(req.userId),
      });

      return res.status(200).json({ message: "Post deleted!" });
    } else {
      const err = new Error("You are not allowed to delete this post");
      err.statusCode = 402;
      clearImage(req.file ? req.file.path : null);
      return next(err);
    }
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
  }
};

const likePost = async (req, res, next) => {
  try {
    const like = await Like.findOne({
      user: mongoose.Types.ObjectId(req.userId),
      post: mongoose.Types.ObjectId(req.params.postid),
    });

    if (like) {
      await Post.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(req.params.postid) },
        { $pull: { likes: req.userId } },
        { new: true }
      );

      await Like.findOneAndDelete({
        user: req.userId,
        post: req.params.postid,
      });
      return res.status(200).json({ message: "Post unliked" });
    } else {
      const like = new Like({
        user: req.userId,
        post: req.params.postid,
      });
      await like.save();
      await Post.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(req.params.postid) },
        { $push: { likes: like.user } },
        { new: true }
      );
      return res.status(200).json({ message: "Post liked" });
    }
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
  }
};

const createComment = async (req, res, next) => {
  try {
    // const {likes} = await Post.findOne({_id: mongoose.Types.ObjectId(req.params.postid)}).populate('likes');
    const comment = new Comments({
      user: req.userId,
      content: req.body.content,
      post: req.params.postid,
    });
    await comment.save();

    await Post.updateOne(
      { _id: req.params.postid },
      { $push: { comments: comment._id } },
      { new: true }
    );

    return res.status(200).json({ message: "Commented" });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comments.findOneAndDelete(
      {
        _id: mongoose.Types.ObjectId(req.params.commentid),
        user: mongoose.Types.ObjectId(req.userId),
      },
      { new: true }
    );

    await Post.findOneAndUpdate(
      { _id: req.params.postid },
      { $pull: { comments: req.params.commentid } },
      { new: true }
    );
    return res.status(200).json({ message: "Comment Deleted" });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
  }
};

const updateComment = async (req, res, next) => {
  try {
    const comment = await Comments.findOneAndUpdate(
      {
        _id: mongoose.Types.ObjectId(req.params.commentid),
        user: mongoose.Types.ObjectId(req.userId),
      },
      { content: req.body.content },
      { new: true }
    );

    if (!comment) {
      err = new Error("You are not allowed to update this post");
      err.statusCode = 402;
      return next(err);
    }
    return res.status(200).json({ message: "Updated Comment" });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
  }
};

module.exports = {
  createPost,
  updatePost,
  clearImage,
  deletePost,
  likePost,
  createComment,
  updateComment,
  deleteComment,
  getPosts,
  getPost,
};
