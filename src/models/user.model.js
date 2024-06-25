const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        fullName: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    let user = this;
    if (!user.isModified("password")) {
        return next();
    }
    const saltIt = parseInt(process.env.PASSWORD_SALT)
    const salt = await bcrypt.genSalt(saltIt);
    user.password = await bcrypt.hashSync(user.password, salt); // hash password

    return next();
});

userSchema.methods.comparePassword = async function (
    candidatePassword
) {
    const user = this;
    return bcrypt.compare(candidatePassword, user.password).catch((e) => false);
};

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
