const express = require("express");
const app = express();
const connectionDB = require('./db/dbconnect');
const StudentRoutes = require('./routes/studentRoutes');
const classRoute = require('./routes/classRoute');
const Attendance = require('./routes/Attendance');
const cors = require('cors');

// Connect to the database
connectionDB();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin:"*",
  credentials: true,
}))

// Use Student routes with '/students' base path
app.use("/students", StudentRoutes);
app.use("/class", classRoute);
app.use("/attendance", Attendance);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const port = 8000;
app.listen(port, () => {
  console.log(`Server successfully connected to port ${port}.`);
});
