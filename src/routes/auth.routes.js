const express = require("express");
const {login, logout, register} = require("../controllers/auth.controller");
const {validatePassword} = require("../middlewares/auth.middleware")

const router = express.Router()

router.route('/auth/register').post(register)

router.route('/auth/login').post(validatePassword, login)

router.route('/auth/logout')
    .post(logout)

module.exports = router;