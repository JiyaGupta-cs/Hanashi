require('dotenv').config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();

const MONGO_URL = process.env.MONGO_URL;
mongoose.connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));
    

const PORT = process.env.PORT || 8000;
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const Blog = require("./models/blog");

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve('./public')));

app.get('/', async (req, res) => {
    try {
        const allBlogs = await Blog.find({});
        res.render("home", {
            user: req.user,
            blogs: allBlogs,
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).send("Server Error");
    }
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT,  "0.0.0.0", () => {
    console.log(`Server Started at Port: ${PORT}`);
});
