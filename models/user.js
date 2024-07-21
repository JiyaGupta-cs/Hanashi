const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    profileImageURL: {
        type: String,
        default: "https://w7.pngwing.com/pngs/832/40/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png",
    },
    password: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    }
}, { timestamps: true });

userSchema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password")) return next();
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = createHmac('sha256', salt).update(user.password).digest("hex");
    user.salt = salt;
    user.password = hashedPassword;
    next();
});

userSchema.static("matchPasswordandGenerateToken",async function(email,password){
    const user =await this.findOne({email});
    if(!user) throw new Error("User Not Found");
    const salt = user.salt;
    const hashedPassword = user.password;
    const userProvidedHash = createHmac('sha256', salt).update(password).digest("hex");
    if(hashedPassword !== userProvidedHash) throw new Error("Incorrect Paswsword");
    const token = createTokenForUser(user);
    console.log(token);
    return token;
})


const User = model("user", userSchema);

module.exports = User;
