const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { spawn } = require("child_process");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

const PATH = "../generatedCode/";
const logFilePath = `${PATH}python_output.log`;

function compilePython(code) {
  const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

  // Spawn a new process to run the Python file
  const pythonProcess = spawn("../myenv/bin/python3", [
    `${PATH}python_code.py`,
  ]);

  // Handle the output
  pythonProcess.stdout.on("data", (data) => {
    logStream.write(`Output: ${data}`);
    io.emit("logUpdate", `Output: ${data}`);
  });

  // Handle errors
  pythonProcess.stderr.on("data", (data) => {
    logStream.write(`Error: ${data}`);
    io.emit("logUpdate", `Error: ${data}`);
  });

  // Handle process completion
  pythonProcess.on("close", (code) => {
    logStream.write(`Child process exited with code ${code}`);
    io.emit("logUpdate", `Child process exited with code ${code}`);
    logStream.end();
  });
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("."));

app.post("/save_code", (req, res) => {
  console.log("hello");
  const code = req.body.code;
  const filename = PATH + "python_code.py";
  fs.writeFile(filename, code, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save the file" });
    } else {
      compilePython(code);
      res.json({ message: `Code saved successfully to ${filename}` });
    }
  });
});

io.on("connection", (socket) => {
  console.log("A client connected");

  // Send initial log content
  fs.readFile(logFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading log file:", err);
    } else {
      socket.emit("logUpdate", data);
    }
  });

  // Watch the log file for changes
  const watcher = fs.watch(logFilePath, (eventType, filename) => {
    if (eventType === "change") {
      fs.readFile(logFilePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading log file:", err);
        } else {
          socket.emit("logUpdate", data);
        }
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
    watcher.close();
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
