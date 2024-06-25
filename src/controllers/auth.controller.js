const asyncHandler = require("../helper/asyncHandler");
const {jwtSign} = require('../helper/jwt.helper');
const ErrorResponse = require("../helper/errorResponse");
const UserModel = require("../models/user.model");
const {omit} = require("lodash");

/*******************************************************************
 * @desc                Register a new user as partner
 * @Method              POST
 * @URL                 /api/auth/register-partner
 * @access              Private
 *******************************************************************/
exports.register = asyncHandler(async (req, res, next) => {

    const user = await UserModel.create(req.body);
    if (!user) return next(new ErrorResponse("Server error", 500));

    const userToObject = user.toObject();
    delete userToObject.password;

    const token = await jwtSign(userToObject);

    res.status(200).send({
        success: true,
        user: userToObject,
        token
    });
});


/*******************************************************************
 * @desc                Login user and create session using jwt
 * @Method              POST
 * @URL                 /api/auth/login
 * @access              Public
 * @Response            Object {"title": title, "url"}
 *******************************************************************/
exports.login = asyncHandler(async (req, res, next) => {

    const user = req.user;
    if (!user) return next(new ErrorResponse("Server Error", 500))
    const userData = omit(user, 'password')

    const token = await jwtSign(userData);

    res.status(200).send({
        success: true,
        user: userData,
        token
    });
});

/*******************************************************************
 * @desc                Log out user and destroy session
 * @Method              POST
 * @URL                 /api/auth/log-out
 * @access              Public
 * @Response            Object {"title": title, "url"}
 *******************************************************************/
exports.logout = asyncHandler(async (req, res, next) => {
    res.clearCookie('token');
    res.status(200).send({
        success: true,
        message: "Déconnexion réussie"
    });
});
