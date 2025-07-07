const mongoose = require("mongoose");
const Repository = require("../models/repository.js");
const Issue = require("../models/issue.js");

const createIssue = async (req, res) => {
    const {title, description} = req.body;
    const {repoID} = req.params;

    try {
        const issue = new Issue({
        title: title,
        description: description,
        status: "open",
        repository: repoID
    });

        let result = await issue.save();
        const repository = await Repository.findById(repoID);
        repository.issues.push(result._id);
        await repository.save();

        res.status(201).json({message: "New issue created successfully"});
    } catch(err) {
        console.error("Error creating the issue", err);
        res.status(500).send("Server Error");
    }    
}

const updateIssue = async (req, res) => {
    const issueID = req.params;
    const {title, description, status} = req.body;

    try {
        const issue = Issue.findById(issueID);

        if(!issue) {
            return res.status(404).json({error: "Issue not found"});
        }

        if(title){
        issue.title = title;
        }

        if(description){
        issue.description = description;
        }

        if(status){
        issue.status = status;
        }

        await issue.save();

        res.json({message: "Issue updated.", issue});

    } catch(err) {
        console.error("Error during issue updation", err);
        res.status(500).send("Server Error");
    }
}

const deleteIssue = async (req, res) => {
    const {issueID} = req.params;

    try {
        let result = Issue.findByIdAndDelete(issueID);

        if(!result) {
            return res.status(404).json({error: "Issue not found"});
        }

        res.json({message: "Issue deleted.", result});

    } catch (err) {
        console.error("Error deleting the issue", err);
        res.status(500).send("Server Error");
    }
}

const getAllIssues = async (req, res) => {
    const {repoID} = req.params;

    try {

        const issues = Issue.find({repository: repoID});

        if(!issues) {
            return res.status(404).json({error: "Issues not found"});
        }

        res.status(200).json({message: "Issues found successfully", issues});

    } catch (err) {
        console.error("Error listing the issues", err);
        res.status(500).send("Server Error");
    }
}

const getIssueById = async (req, res) => {
    const {issueID} = req.params;
     try {
        const issue = Issue.findById(issueID);

         if(!issue) {
            return res.status(404).json({error: "Issue not found"});
        }

        res.status(200).json({message: "Issue found successfully", issue});

     } catch(err) {
        console.error("Error fetching the issue.", err);
        res.status(500).send("Server Error");
     }
}

module.exports = {
    createIssue, updateIssue, deleteIssue, getAllIssues, getIssueById
}