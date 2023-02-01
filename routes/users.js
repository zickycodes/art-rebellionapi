const express = require("express");
const router = express.Router();
const { check, body } = require("express-validator");
const isauth = require("../middleware/is-auth.");
const userController = require("../controllers/user");

// const User = require("../models/User");
// const authcontroller = require("../controllers/auth");

// Posts
router.post(
  "/post",
  [
    body("title").not().isEmpty().withMessage("title is required"),
    body("content").not().isEmpty().withMessage("content is required"),
    body("category")
      .not()
      .isIn(["tech", "science", "business", "others"])
      .withMessage(
        "category should be one of tech, science, business or others"
      ),
  ],
  isauth,
  userController.createPost
);
router.post("/post/:id", isauth, userController.updatePost);
router.get("/post", userController.getPosts);
router.get("/post/:postid", userController.getPost);
router.delete("/post/:id", isauth, userController.deletePost);

// Likes
router.put("/post/likes/:postid", isauth, userController.likePost);

// Comments
router.post("/post/:postid/comments", isauth, userController.createComment);
router.put("/post/comments/:commentid", isauth, userController.updateComment);
router.delete(
  "/post/comments/:postid/:commentid",
  isauth,
  userController.deleteComment
);

module.exports = router;
