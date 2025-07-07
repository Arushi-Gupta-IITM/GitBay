const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const repoSchema = new Schema({

    name: {
        type: String,
        required: true,
        unique: true
    },

    description: {
        type: String
    },

    content: [
        {
            type: String
        }
    ],

    visibility: {
    type: String,
    enum: ['Public', 'Private'],
    default: 'Public'
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    issues: [
        {
            type: Schema.Types.ObjectId,
            ref: "Issue"
        }
    ],
    default: []
}, {timestamps: true});

const Repository = mongoose.model("Repository", repoSchema);
module.exports = Repository;