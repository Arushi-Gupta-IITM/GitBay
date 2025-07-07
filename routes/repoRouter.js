const express = require("express");
const repoRouter = express.Router();
const repoController = require("../controllers/repository.js");
const authMiddleware = require("../middlewares/authMiddleware");

repoRouter.get("/create", authMiddleware, repoController.renderCreateRepoPage);

repoRouter.get("/dashboard/:username", repoController.renderDashboardPage);

repoRouter.post("/create", authMiddleware, repoController.createRepository);

repoRouter.get("/all", repoController.allRepositories);

repoRouter.get("/id/:id", repoController.fetchRepositorybyId);

repoRouter.get("/name/:name", repoController.fetchRepositorybyName);

repoRouter.get("/userId/:userID", repoController.fetchReposForCurrentUser);

repoRouter.post("/update/:repoID", repoController.updateRepositorybyId);

repoRouter.delete("/delete/:repoID", repoController.deleteRepository);

repoRouter.patch("/toggle/:repoID", repoController.toggleVisibilityById);

module.exports = repoRouter;