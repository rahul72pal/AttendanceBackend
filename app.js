const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const connectionDB = require('./db/dbconnect');
const StudentRoutes = require('./routes/studentRoutes');
const classRoute = require('./routes/classRoute');
const Attendance = require('./routes/Attendance');
const userRoute = require('./routes/user');
const passport = require('./config/passport');
const cors = require('cors');

// Connect to the database
connectionDB();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://students-nine-iota.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(cors({
  origin:"*",
  credentials: true,
}))

// Use Student routes with '/students' base path
app.use("/students", StudentRoutes);
app.use("/class", classRoute);
app.use("/attendance", Attendance);
app.use("/auth", userRoute);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const port = 8000;
app.listen(port, () => {
  console.log(`Server successfully connected to port ${port}.`);
});
