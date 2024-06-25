const asyncHandler = require("../helper/asyncHandler")
const ErrorResponse = require("../helper/errorResponse")
const {verifyJwt} = require('../helper/jwt.helper')
const {omit} = require("lodash");
const UserModel = require("../models/user.model");

/*******************************************
 * @type {function(*=, *=, *=): Promise<*>}
 *******************************************/
//protect routes
exports.protectWithToken = asyncHandler(async (req, res, next) => {
    let token
    if (req?.cookies?.token) {
        token = req.cookies.token
    } else if (req?.headers?.authorization && req?.headers?.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
        return next(new ErrorResponse('Non authentifié, vous devez vous authentifier', 401))
    }

    const {expired, verifiedToken} = await verifyJwt(token)
    const user = verifiedToken

    if (verifiedToken) {
        req.user = user
        return next()
    }

    //TODO:
    // if (expired) {
    //     console.log("ssssssss")
    // }


    res.status(401).send({
        success: false,
        message: "Le token d'accès n'est pas correct, vous devez vous authentifier"
    })
})


/*******************************************
 * @type {function(*=, *=, *=): Promise<*>}
 *******************************************/
//protect routes
exports.validatePassword = asyncHandler(async (req, res, next) => {

    const {email, password} = req.body;

    // Find user by email
    const user = await UserModel.findOne({email});
    if (!user) {
        return next(new ErrorResponse(`Il n'y a aucun utilisateur avec cette adresse e-mail ${email}`, 404));
    }
    // Compare password
    const isValid = await user.comparePassword(password);

    if (!isValid) {
        return next(new ErrorResponse(`Le mot de passe n'est pas correct`, 401));
    }

    const userToObject = user.toObject();
    delete userToObject.password;
    req.user = userToObject

    next();
})
