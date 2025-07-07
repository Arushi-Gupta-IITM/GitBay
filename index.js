const express = require("express");
const session = require("express-session");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const {Server} = require("socket.io");
const ejs = require("ejs");
const path = require("path");
const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");
const MongoStore = require('connect-mongo');
const methodOverride = require("method-override");
const mainRouter = require("./routes/mainRouter.js");

const yargs = require("yargs");
const {hideBin} = require("yargs/helpers");


const initRepo = require("./controllers/init.js");
const addRepo = require("./controllers/add.js");
const commitRepo = require("./controllers/commit.js");
const pullRepo = require("./controllers/pull.js");
const pushRepo = require("./controllers/push.js");
const revertRepo = require("./controllers/revert.js");
const { AppConfig } = require("aws-sdk");

if(process.env.Node_ENV != "production") {
    dotenv.config();    
}

yargs(hideBin(process.argv))

.command("start", "Starts the server.",   () => {}, startServer)           

.command("init", "Initialize a new repository.", {}, initRepo)

.command("add <file>", "Add a new file to the repository.", (yargs) => {
    yargs.positional("file", {
        describe: "File to add to the staging area",
        type: "string"
    });
},(argv) => {
    addRepo(argv.file);
})

.command("commit <message>", "Commit changes of staged files.", (yargs) => {
    yargs.positional("message", {
        describe: "Commit message",
        type: "string"
    });
}, (argv) => {
    commitRepo(argv.message);
})

.command("push", "Push a new repository to GitBay.", {}, pushRepo)

.command("pull", "Pull an existing repository from GitBay.", {}, pullRepo)

.command("revert <commitID>", "Revert to a specific commit.", (yargs) => {
    yargs.positional("commitID", {
        describe: "Commit ID to revert to",
        type: "string"
    });
}, (argv) => {
    revertRepo(argv.commitID);
})

.demandCommand(1, "You need atleast one command")
.help().argv;

function startServer() {
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(express.json());
    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "ejs");
    app.use(express.urlencoded({extended: true}));
    app.use(methodOverride('_method'));
    app.engine("ejs", ejsMate);
    app.use(express.static(path.join(__dirname, "/public")));
    app.use(cookieParser());

    const store = MongoStore.create({
        mongoUrl: process.env.CONNECTION_STRING,
        secret: process.env.SESSION_SECRET,
        touchAfter: 24*60*60
    });

    store.on("error", () => {
        console.log("ERROR in MONGO SESSION STORE.", err);
    });

    app.use(session({
        store,
        secret: process.env.SESSION_SECRET || "gitbaySecretKey",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // true only if HTTPS
            maxAge: 24*60*60*1000 // 24 hours
        }
    }));


    const mongoURI = process.env.CONNECTION_STRING;

    mongoose
    .connect(mongoURI)
    .then(() => {
        console.log("Database connected!");
    })
    .catch((err) => {
        console.error("Unable to connect to database", err);
    })

    app.use(cors({origin: "*"}));

    app.get("/", (req, res) => {
        res.render("home");
    });

    app.use("/", mainRouter);

    let user = "test";

    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    }        
    );

    io.on("connection", (socket) => {
        socket.on("joinRoom", (userId)=> {
            user = userID;
            console.log("====");
            console.log(user);
            console.log("====");
            socket.join(userId);
        });
    });

    const db = mongoose.connection;

    db.once("open", async()=> {
        console.log("CRUD Operations called");
        //CRUD operations
    });

    httpServer.listen(port, ()=> {
        console.log(`Server is running on port ${port}.`);
    });
}