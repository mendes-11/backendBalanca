const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();


async function connectToDB() {
  try {
    await mongoose.connect("mongodb+srv://equiblocksvl:eaLOHLhHY1ezCcSr@equiblocks.gput2z2.mongodb.net/?retryWrites=true&w=majority&appName=Equiblocks", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
}

connectToDB();

app.use(
  cors({
    origin: true,
    methods: "GET,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

require("./startup/routes")(app);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server is running on port ${port}`));