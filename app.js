require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");
const { pool, createTable, sendEmail } = require("./database");
const taskReminder = require("./clon");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Auth = require("./auth");

app.use(express.static("project"));
app.use("/project_js", express.static(path.join(__dirname, "project_js")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// SIGN UP ROUTE



// SIGN IN ROUTE

app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;
  const checkCmd = `SELECT * FROM usersInfo WHERE email=?;`;

  try {
    const [rows] = await pool.execute(checkCmd, [email]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    const hashpassword = rows[0].password;
    const ismatch = await bcrypt.compare(password, hashpassword);
    if (!ismatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    const AccessToken = jwt.sign(
      { user: rows[0].user_id, email: email },
      process.env.Access_Control,
      { expiresIn: "15m" },
    );

    const RefreshToken = jwt.sign(
      { user: rows[0].user_id, email: email },
      process.env.Refresh_Control,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      RefreshToken, // Fixed exact name matching frontend key
      AccessToken,
      message: "Login successful",
      success: true,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// TOKEN REFRESH ROUTE

app.post("/refresh", async (req, res) => {
  const header = req.headers.authorization;
  if (!header) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  const token = header.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid token format" });
  }

  try {
    const decodedUser = jwt.verify(token, process.env.Refresh_Control);

    // Fixed: Pulling email safely from decoded token payload variable
    const newAccessToken = jwt.sign(
      { user: decodedUser.user, email: decodedUser.email },
      process.env.Access_Control,
      { expiresIn: "15m" },
    );

    res.status(200).json({
      success: true,
      message: "New access token created",
      newAccessToken,
    });
  } catch (error) {
    console.log("Refresh error:", error.message);
    res.status(401).json({ success: false, message: error.message });
  }
});

// PROTECTED ADD TASK ROUTE

app.post("/add-Task", Auth, async (req, res) => {
  const { user: user_id } = req.user;
  const { task_name, category, task_type, description, reminder_time } =
    req.body;

  const data = [
    user_id,
    task_name,
    category,
    task_type,
    description,
    reminder_time || null,
  ];

  const insertCmd = `INSERT INTO tasks (user_id,task_name,category,task_type,description,reminder_time) VALUES(?,?,?,?,?,?);`;

  try {
    const [result] = await pool.execute(insertCmd, data);
    if (result.affectedRows === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to insert task records" });
    }
    res.status(201).json({ success: true, message: "Successfully added task" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred, please try again later",
    });
  }
});

app.get("/search", Auth, async (req, res) => {
  console.table(req.query);
  const { searchType, searchValue } = req.query;
  const { user: user_id } = req.user;
  const allowedcolumn = ["task_name", "category", "task_type", "status"];
  const value = [user_id];
  let searchCmd = `SELECT
  id,
  task_name,
  category,
  task_type,
  description,
  reminder_time,
  status
FROM tasks
WHERE user_id = ? `;
  if (searchValue && allowedcolumn.includes(searchType)) {
    searchCmd += `AND ${searchType} = ?`;
    value.push(searchValue);
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid search type",
    });
  }
 try {
  const [result] = await pool.execute(searchCmd, value);

  if (result.length === 0) {
    console.log("NO Task in this type");

    return res.status(404).json({
      success: false,
      message: `NO Task in ${searchType}`,
    });
  }

  console.log(result);

  res.status(200).json({
    success: true,
    message: "Congratulations, here is your value",
    data: result,
  });

} catch (error) {
  console.error(error.message);

  res.status(500).json({
    success: false,
    message: "Error occurred, please try again later",
  });
}
});

taskReminder();

// Initialize server
(async () => {
  try {
    const PORT = process.env.PORT || process.env.port ;
    await createTable();
    app.listen(PORT, () => {
      console.log(`Server running smoothly on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize database:", error.message);
    process.exit(1);
  }
})();
