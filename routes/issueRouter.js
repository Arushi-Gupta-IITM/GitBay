const express = require("express");
const issueRouter = express.Router();
const issueController = require("../controllers/issue.js");

issueRouter.post("/create/:repoID", issueController.createIssue);

issueRouter.post("/update/:issueID", issueController.updateIssue);

issueRouter.delete("/delete/:issueID", issueController.deleteIssue);

issueRouter.get("/all/:repoID", issueController.getAllIssues);

issueRouter.get("/:issueID", issueController.getIssueById);

module.exports = issueRouter;