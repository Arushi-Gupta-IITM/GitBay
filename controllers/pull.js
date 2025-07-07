const {S3, S3_BUCKET} = require("../config/aws-config.js");
const fs = require("fs").promises;
const path = require("path");

async function pullRepo() {
    const repoPath = path.resolve(process.cwd(), ".bayGit");
    const commitsPath = path.join(repoPath, "commits");

    try {
        await fs.mkdir(commitsPath, {recursive: true});
        const data = await S3.listObjectsV2({
            Bucket: S3_BUCKET,
            Prefix: "commits/"
        }).promise();

        const objects = data.Contents;

        for(const object of objects) {
            const key = object.Key;
            const commitDir = path.join(commitsPath, path.dirname(key).split("/").pop());
            await fs.mkdir(commitDir, {recursive: true});

            const params = {
                Bucket: S3_BUCKET,
                Key: key
            }

            const fileContent = await S3.getObject(params).promise();
            await fs.writeFile(path.join(repoPath, key), fileContent.Body);
        }
        console.log("All commits pulled from S3.");
    } catch(err) {
        console.error("Error pulling files from S3", err);
    }
}

module.exports = pullRepo;