const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/user.js");
const authMiddleware = require("../middlewares/authMiddleware");

userRouter.get("/allUsers", userController.getAllUsers);

userRouter.post("/signup", userController.signup);

userRouter.post("/login", userController.login);

userRouter.get("/userProfile/:id", authMiddleware, userController.getUser);

userRouter.put("/updateProfile/:id", userController.updateUser);

userRouter.delete("/deleteProfile/:id", userController.deleteUser);

userRouter.get("/logout", userController.logout);

module.exports = userRouter;