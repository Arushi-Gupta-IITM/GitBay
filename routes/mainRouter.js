const express = require("express");
const mainRouter = express.Router();
const userRouter = require("./userRouter.js");
const repoRouter = require("./repoRouter.js");
const issueRouter = require("./issueRouter.js");
const authMiddleware = require("../middlewares/authMiddleware.js");
const { renderDashboardPage } = require("../controllers/repository.js");

mainRouter.use("/user", userRouter);
mainRouter.use("/repo", repoRouter);
mainRouter.use("/issue", issueRouter);

mainRouter.get("/signup", (req, res) => {
    res.render("auth/signup.ejs");
});

mainRouter.get("/login", (req, res) => {
    res.render("auth/login.ejs");
});

mainRouter.get("/dashboard/:username", authMiddleware, renderDashboardPage);

module.exports = mainRouter;
