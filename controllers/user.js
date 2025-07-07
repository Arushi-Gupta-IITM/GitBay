const jwt = require("jsonwebtoken");
const {MongoClient} = require("mongodb");
const bcrypt = require("bcryptjs");
const ObjectId = require("mongodb").ObjectId;

const dotenv = require("dotenv");
dotenv.config();
const uri = process.env.CONNECTION_STRING;

let client;

async function connectClient() {
  if (!client) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
  }
}

const renderSignUpPage = () => {
    res.render("auth/signup.ejs");
}

const renderLoginPage = () => {
    res.render("auth/login.ejs");
}

const signup = async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        await connectClient();
        const db = client.db("gitbay");
        const usersCollection = db.collection("users");
        const repoCollection = db.collection("repositories");

        const duplicateUsername = await usersCollection.findOne({username: username});
        const duplicateEmail = await usersCollection.findOne({email: email});

        if(duplicateUsername || duplicateEmail) {
            return res.status(409).json({message: "User already exists."})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username: username,
            password: hashedPassword,
            email: email,
            repositories: [],
            followedUsers: [],
            starredRepos: []
        }

        const result = await usersCollection.insertOne(newUser);

        const token = jwt.sign(
        { userId: result.insertedId, username: username },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    req.session.allRepo = await repoCollection.find({}).toArray();
    req.session.userRepo = await repoCollection.find({ username: username }).toArray();

    res.redirect(`/dashboard/${username}`);        
} catch(err) {
        console.error("Unable to sign-up :", err);
        res.status(500).send("Server error");
    }
}

const login = async (req, res) => {
    const {email, password} = req.body;

    try {
        await connectClient();
        const db = client.db("gitbay");
        const usersCollection = db.collection("users");
        const repoCollection = db.collection("repositories");

        const user = await usersCollection.findOne({email: email});

         if(!user) {
            return res.status(404).json({message: "Invalid credentials."});
        }

        const username = user.username;

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(404).json({message: "Invalid credentials."});
        }

        const token = jwt.sign(
            {userId: user._id, username: username},
            process.env.JWT_SECRET_KEY,
            {expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
        });

        req.session.allRepo = await repoCollection.find({}).toArray();
        req.session.userRepo = await repoCollection.find({ username: username }).toArray();

        res.redirect(`/dashboard/${username}`);
    } catch(err) {
        console.error("Unable to log-in :", err);
        res.status(500).send("Server error");
    }
}

const getAllUsers = async (req, res) => {
    try {
        await connectClient();
        const db = client.db("gitbay");
        const usersCollection = db.collection("users");

        const users = await usersCollection.find({}).toArray();
        res.json(users);

    } catch(err) {
        console.errror("Error during fetching", err);
    }
}

const getUser = async (req, res) => {
    let {id} = req.params;

     try {
        await connectClient();
        const db = client.db("gitbay");
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({_id: new ObjectId(id)});  
        
        if(!user) {
            return res.status(404).json({message: "User not found!"});
        }

        const repoIds = user.repositories; // array of ObjectIds

        const userRepo = await db.collection("repositories").find({
        _id: { $in: repoIds }
        }).toArray(); 

        

        res.render("user/profile.ejs", {user, userRepo});
    } catch(err) {
        console.error("Error during fetching", err);
    }
}

const updateUser = async (req, res) => {
    let {id} = req.params;
    const {email, password} = req.body;

    try {

        let updatedFields = {email};
        if(password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updatedFields.password = hashedPassword;
        }

        await connectClient();
        const db = client.db("gitbay");
        const usersCollection = db.collection("users");

        let result = await usersCollection.findOneAndUpdate({
            _id: new ObjectId(id),
        }, 
        {$set: updatedFields},
        {returnDocument: "after"});

        console.log(result);

        if(!result) {
            return res.status(404).json({message: "User not found"})
        }

        res.send(result);
    } catch(err) {
        console.error("Error updating the profile", err);
        res.status(500).send("Server Error");
    }
}


const deleteUser = async (req, res) => {
    let {id} = req.params;

    try {
        await connectClient();
        const db = client.db("gitbay");
        const usersCollection = db.collection("users");

        const result = await usersCollection.deleteOne({_id: new ObjectId(id)});

        if(result.deletedCount === 0) {
            return res.status(404).json({message: "User not found"})
        }

        res.send(result);

    } catch(err) {
        console.error("Error deleting the profile", err);
        res.status(500).send("Server Error");
    }
}

const logout = (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
}


module.exports = {
    getAllUsers, signup, login, getUser, updateUser, deleteUser, renderSignUpPage, renderLoginPage, logout
};

