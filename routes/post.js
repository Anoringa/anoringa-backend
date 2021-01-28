var express = require("express");
const PostController = require("../controllers/PostController");

var router = express.Router();

router.get("/", PostController.postList);
router.get("/:id", PostController.postDetail);
router.post("/", PostController.postStore);
//router.put("/:id", PostController.bookUpdate);
//router.delete("/:id", PostController.bookDelete);
module.exports = router;