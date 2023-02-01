const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");

router.get("/unapprovedposts", adminController.unapprovedPost);
router.put("/approvepost/:postid", adminController.approvedPost);
router.get("/declinepost/:postid", adminController.declinePost);

module.exports = router;
