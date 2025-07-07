const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String
    },

    repositories: [
        {
            default: [],
            type: Schema.Types.ObjectId,
            ref: "Repository"
        }
    ],

    followedUsers: [
        {
            default: [],
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    starredRepos: [
        {
            default: [],
            type: Schema.Types.ObjectId,
            ref: "Repository"
        }
    ]
});

const User = mongoose.model("User", userSchema);
module.exports = User;