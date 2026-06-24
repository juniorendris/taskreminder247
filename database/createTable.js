const pool = require("./pool");

async function createTable() {
  const createCmd = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,

      task_name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      task_type VARCHAR(100),
      description TEXT,

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reminder_time DATETIME,

      status ENUM('pending','completed') DEFAULT 'pending',

      FOREIGN KEY (user_id) REFERENCES usersInfo(user_id)
    );
  `;
  const creatuserTableCmd = `
    CREATE TABLE IF NOT EXISTS usersInfo (
      user_id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(100),
      email VARCHAR(198) UNIQUE,
      password VARCHAR(255),
      Major VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const createIndexCmd = `
    CREATE INDEX idx_reminder
    ON tasks(status, reminder_time);
  `;
  try {
    console.log("User table is being created");
    await pool.query(creatuserTableCmd);
    console.log("User table created successfully");

    console.log("Task table is being created");
    await pool.query(createCmd);
    console.log("Task table created successfully");
    try{
      console.log('index is being created');
      await pool.query(createIndexCmd);
       console.log('index have been created');
    }catch(error){
       console.log(error.message);
    }
  } catch (error) {
    console.error(error.message);
  }
}

module.exports = createTable;
