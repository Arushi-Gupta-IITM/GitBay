const AWS = require("aws-sdk");
const env = require('dotenv').config();

AWS.config.update({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey: process.env.SECRETACCESSKEY
    }
});

const S3 = new AWS.S3();
const S3_BUCKET = "gitbay-bucket";

module.exports = {S3, S3_BUCKET};