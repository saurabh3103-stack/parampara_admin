const express = require("express");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

app.post("/webhook", (req, res) => {
    const payload = req.body;
    
    if (payload.ref === "refs/heads/main") {  // Adjust for the correct branch
        console.log("New commit detected. Pulling changes...");

        exec("cd /parampara_admin && git pull && npm install && pm2 restart app", (err, stdout, stderr) => {
            if (err) {
                console.error(`Error: ${err.message}`);
                return res.status(500).send("Error updating project");
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
            res.status(200).send("Updated successfully");
        });
    } else {
        res.status(200).send("No update needed");
    }
});

app.listen(3000, () => console.log("Webhook server running on port 3000"));
