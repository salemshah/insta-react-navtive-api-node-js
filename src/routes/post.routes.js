const express = require("express");
const { protectWithToken } = require("../middlewares/auth.middleware");
const uploadImageMiddleware = require("../middlewares/uploadImage.middleware");
const {
    getPostsByUserId,
    getAllPosts,
    createPost,
    updatePost,
    deletePost,
    addComment,
    toggleLike
} = require("../controllers/post.controller");

const router = express.Router();

router.route('/posts')
    .post(protectWithToken, uploadImageMiddleware("image"), createPost)
    .get(getAllPosts);


router.route('/posts/:userId/current-user')
    .get(getPostsByUserId)

router.route('/posts/:id')
    .put(protectWithToken, uploadImageMiddleware("image"), updatePost)
    .delete(protectWithToken, deletePost);

router.route('/posts/:id/comments')
    .post(protectWithToken, addComment);

router.route('/posts/:id/like')
    .post(protectWithToken, toggleLike)

module.exports = router;
