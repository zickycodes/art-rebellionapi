const express = require("express");
const app = express();
// const dotenv = require("dotenv");
const mongoose = require("mongoose");

const path = require("path");
const bodyParser = require("body-parser");

const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const adminRoute = require("./routes/admin");

// dotenv.config();

// app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", "views");

try {
  const mongCon = async () => {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to Mongo");
  };
  mongCon();
} catch (error) {
  console.log(error);
  handleError(error);
}

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/admin", adminRoute);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

app.listen(5000, () => {
  console.log("I am ready for connections");
});
