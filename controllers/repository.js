const mongoose = require("mongoose");
const Repository = require("../models/repository.js");
const User = require("../models/user.js");
const Issue = require("../models/Issue");

const renderCreateRepoPage = (req, res) => {
    res.render("repo/newRepo.ejs");
}

const renderDashboardPage = async (req, res) => {
     try {
    const username = req.params.username;
    const user = await User.findOne({ username })

    const allRepo = await Repository.find();
    const userRepo = await Repository.find({ owner: user._id});

    res.render("dashboard", { allRepo, userRepo });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.status(500).send("Server Error");
  }
}

const createRepository = async (req, res) => {
  const { name, description, visibility, issueTitle, issueDesc } = req.body;
  const owner = req.userId;

  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }

    const user = await User.findById(owner);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Create repository 
    const newRepository = new Repository({
      name,
      description,
      visibility: visibility || undefined,
      owner,
    });

    const savedRepository = await newRepository.save();

    // Create and attach issue if provided
    if (issueTitle && issueDesc) {
      const newIssue = new Issue({
        title: issueTitle,
        description: issueDesc,
        repository: savedRepository._id,
      });

      const savedIssue = await newIssue.save();

      // Attach to repository
      savedRepository.issues.push(savedIssue._id);
      await savedRepository.save();
    }

    // Attach repository to user
    user.repositories.push(savedRepository._id);
    await user.save();

    res.redirect(`/dashboard/${user.username}`);
  } catch (err) {
    console.error("Error creating repository:", err);
    res.status(500).send("Server Error");
  }
};

const allRepositories = async (req, res) => {
    try {
        //.populate is not working for owner, fix it.
        const repositories = await Repository.find({}).populate("owner").populate("issues");
        res.json(repositories);
    } catch(err) {
        console.error("Error fetching the repositories", err);
        res.status(500).send("Server Error");
    }
}

const fetchRepositorybyId = async (req, res) => {
    let {id} = req.params;

    try {
        const repo = await Repository.findById(id).populate("owner");

        if(!repo) {
            return res.status(404).send("Repository not found")
        }
        res.json(repo);
    } catch(err) {
        console.error("Error fetching the repository", err);
        res.status(500).send("Server Error");
    }
}

    

const fetchRepositorybyName = async (req, res) => {
    let {name} = req.params;

    try {
        const repo = await Repository.find({name: name}).populate("owner");

        if(!repo) {
            return res.status(404).send("Repository not found")
        }
        res.json(repo);
    } catch(err) {
        console.error("Error fetching the repository", err);
        res.status(500).send("Server Error");
    }
}

const fetchReposForCurrentUser = async (req, res) => {
    let userId = req.user;

    try {
        const repositories = await Repository.find({owner: userId});

        if(!repositories || repositories.length == 0) {
            return res.status(404).json({error: "User repositories not found."});
        }

        res.json({message: "Repositories found", repositories});
    } catch(err) {
        console.error("Error fetching the user repositories", err);
        res.status(500).send("Server Error");
    }
}

const updateRepositorybyId = async (req, res) => {
    let {repoID} = req.params;
    const {content, description} = req.body;

    try {
        const repository = await Repository.findById(repoID);
        if(!repository) {
            return res.status(404).json({error: "Repository not found."})
        }

        repository.content.push(content);
        repository.description = description;

        const updatedRepository = await Repository.save();
        res.json({message: "Repository updated successfully", updatedRepository});
    } catch(err) {
        console.error("Error updating the repositories", err);
        res.status(500).send("Server Error");
    }
}

const deleteRepository = async (req, res) => {
    let {repoID} = req.params;

    try {
        const repository = await Repository.findByIdAndDelete(repoID);
        if(!repository) {
            return res.status(404).json({error: "Repository not found."})
        }

        res.json({message: "Repository deleted successfully.", repository});
    } catch (err) {
        console.error("Error deleting the repository", err);
        res.status(500).send("Server Error");
    }
}

const toggleVisibilityById = async (req, res) => {
    let {repoID} = req.params;

    try {
        const repository = await Repository.findById(repoID);
        if(!repository) {
            return res.status(404).json({error: "Repository not found."})
        }

        repository.visibility = !repository.visibility;

        const updatedRepository = await Repository.save();
        res.json({message: "Repository visibility toggled successfully.", updatedRepository});
    } catch(err) {
        console.error("Error toggling the repository visibility", err);
        res.status(500).send("Server Error");
    }
}

module.exports = {
    createRepository, allRepositories, fetchRepositorybyId, fetchRepositorybyName, fetchReposForCurrentUser, updateRepositorybyId, deleteRepository, toggleVisibilityById, renderCreateRepoPage, renderDashboardPage
}