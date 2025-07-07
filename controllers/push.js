const fs = require("fs").promises;
const path = require("path");
const {S3, S3_BUCKET} = require("../config/aws-config.js");

async function pushRepo() {
    const repoPath = path.resolve(process.cwd(), ".bayGit");
    const commitsPath = path.join(repoPath, "commits");

    try {
        const commitDirs = await fs.readdir(commitsPath);
        for(let commitDir of commitDirs) {
            const commitPath = path.join(commitsPath, commitDir);
            const files = await fs.readdir(commitPath);

            for(let file of files) {
                const filePath = path.join(commitPath, file);
                const fileContent = await fs.readFile(filePath);
                const params = {
                    Bucket: S3_BUCKET,
                    Key: `commits/${commitDir}/${file}`,
                    Body: fileContent
                };

                await S3.upload(params).promise();
            }
        }

        await fs.rm(commitsPath, {recursive: true, force: true});
        console.log("All commits pushed to S3");
        
    } catch(err) {
        console.error("Error pushing files to S3", err);
    }
}

module.exports = pushRepo;