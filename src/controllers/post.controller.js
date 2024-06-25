const asyncHandler = require("../helper/asyncHandler");
const ErrorResponse = require("../helper/errorResponse");
const Post = require("../models/post.model");

/*******************************************************************
 * @desc                Create new post
 * @Method              POST
 * @URL                 /api/posts
 * @access              Private
 *******************************************************************/
exports.createPost = asyncHandler(async (req, res, next) => {
    const imageUrl = req.file ? req.file.path : '';
    const post = await Post.create({imageUrl, ...req.body});
    if (!post) {
        return next(new ErrorResponse("Error creating post.", 500));
    }
    await post.save();

    res.status(201).send({
        success: true,
        message: 'Post created successfully.',
        data: post
    });
});

/*******************************************************************
 * @desc                Get a single post by ID
 * @Method              GET
 * @URL                 /api/posts/:id
 * @access              Public
 *******************************************************************/
exports.getPostsByUserId = asyncHandler(async (req, res, next) => {
    const post = await Post.find({user: req.params.userId})
        .sort({createdAt: -1})
        .populate({
            path: 'user',
            select: 'fullName'
        })
        .populate('likes')
        .populate('comments.user')
        .exec();

    if (!post) {
        return next(new ErrorResponse("Post not found.", 404));
    }

    res.status(200).send({
        success: true,
        data: post
    });
});

/*******************************************************************
 * @desc                Get all posts
 * @Method              GET
 * @URL                 /api/posts
 * @access              Public
 *******************************************************************/
exports.getAllPosts = asyncHandler(async (req, res, next) => {
    const posts = await Post.find()
        .sort({createdAt: -1})
        .populate({
            path: 'user',
            select: 'fullName'
        })
        .populate({
            path: 'likes',
            select: '_id',
            transform: (doc, id) => id
        })
        .populate({
            path: 'comments.user',
            select: 'fullName'
        })
        .exec();

    res.status(200).send({
        success: true,
        data: posts
    });
});

/*******************************************************************
 * @desc                Update a post by ID
 * @Method              PUT
 * @URL                 /api/posts/:id
 * @access              Private
 *******************************************************************/
exports.updatePost = asyncHandler(async (req, res, next) => {
    const imageUrl = req.file ? req.file.path : undefined;
    const updatedFields = req.body;

    if (imageUrl) {
        updatedFields.imageUrl = imageUrl;
    }

    const post = await Post.findByIdAndUpdate(req.params.id, updatedFields, {new: true, runValidators: true});
    if (!post) {
        return next(new ErrorResponse("Post not found.", 404));
    }

    res.status(200).send({
        success: true,
        message: 'Post updated successfully.',
        data: post
    });
});

/*******************************************************************
 * @desc                Delete a post by ID
 * @Method              DELETE
 * @URL                 /api/posts/:id
 * @access              Private
 *******************************************************************/
exports.deletePost = asyncHandler(async (req, res, next) => {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
        return next(new ErrorResponse("Post not found.", 404));
    }

    res.status(200).send({
        success: true,
        message: 'Post deleted successfully.'
    });
});


/*******************************************************************
 * @desc                Create a comment for a post
 * @Method              POST
 * @URL                 /api/posts/:id/comments
 * @access              Private
 *******************************************************************/
exports.addComment = asyncHandler(async (req, res, next) => {
    const {user, comment} = req.body;

    // Find the post by ID
    const post = await Post.findById(req.params.id);
    if (!post) {
        return next(new ErrorResponse("Post not found.", 404));
    }

    // Add the new comment to the comments array
    post.comments.push({user, comment});

    // Save the updated post
    await post.save();

    res.status(201).send({
        success: true,
        message: 'Comment added successfully.',
        data: post
    });
});

/*******************************************************************
 * @desc                Toggle like/unlike a post
 * @Method              POST
 * @URL                 /api/posts/:id/like
 * @access              Private
 *******************************************************************/
exports.toggleLike = asyncHandler(async (req, res, next) => {
    const {userId} = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) {
        return next(new ErrorResponse("Post not found.", 404));
    }
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex !== -1) {
        post.likes.splice(likeIndex, 1);
        await post.save();
    } else {
        post.likes.push(userId);
        await post.save();
    }

    return res.status(201).send({
        success: true,
        data: post
    });
});
