const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const issueSchema = new Schema({

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open"
    },

    repository: {
        type: Schema.Types.ObjectId,
        ref: "Repository",
        required: "true"
    },
});

const Issue = mongoose.models.Issue || mongoose.model("Issue", issueSchema);
module.exports = Issue;
