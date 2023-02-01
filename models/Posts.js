const mongoose = require("mongoose");
const { Schema } = mongoose;
const LikeSchema = require("./Like");
const CommentSchema = require("./Comment");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: false,
    },

    photo: {
      type: String,
      required: false,
      unique: false,
    },
    content: {
      type: String,
      required: true,
      unique: false,
    },
    Author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categories: {
      type: Array,
      required: false,
    },

    Approved: {
      type: Boolean,
      required: true,
      default: false,
      unique: false,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
