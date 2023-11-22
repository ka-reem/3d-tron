const express = require("express");
const app = express();

app.use(express.static(__dirname));


app.get("/", (req, res) => {
    res.status(200).send();
});

app.listen(3000, () => {
    console.log("Server is now running on port 3000!");
});
