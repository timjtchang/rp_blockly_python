const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs").promises;
const { spawn } = require("child_process");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const { performance } = require("perf_hooks");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Get the directory where saveCode.js is located
const currentDir = __dirname;

// Calculate the paths relative to saveCode.js location
const PATH = path.join(currentDir, "..", "..", "generatedCode");
const VENVPATH = path.join(currentDir, "..", "..", "myenv", "bin", "python3");

const PORT = 3000;
const FILENAME = "python_code.py";

let currentProcess = null;
let serverStartTime;

function emitLog(message) {
  const timestamp = performance.now() - serverStartTime;
  console.log({ timestamp, message });
  io.emit("logUpdate", { timestamp, message });
}

function compilePython(code, action) {
  if (action === "run") {
    io.emit("clearLogs");
    emitLog(`-- START --`);

    currentProcess = spawn(VENVPATH, ["-u", `${PATH}${FILENAME}`]);
    console.log(`Process started with PID: ${currentProcess.pid}`);

    currentProcess.stdout.on("data", (data) => emitLog(`${data}`));
    currentProcess.stderr.on("data", (data) => emitLog(`Error: ${data}`));
    currentProcess.on("exit", (code) => {
      emitLog(`-- END --`);
      currentProcess = null;
    });
  } else if (action === "stop" && currentProcess) {
    console.log(`Stopping process: ${currentProcess.pid}`);
    emitLog(`-- STOP --`);
    currentProcess.kill("SIGKILL");
    currentProcess = null;
  } else {
    emitLog("No running process to stop");
  }
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("."));

app.post("/", (req, res) => res.json("Connected to viewer"));

app.post("/save_code", async (req, res) => {
  const { action, code } = req.body;
  const filePath = `${PATH}${FILENAME}`;

  try {
    if (action === "run") {
      await fs.writeFile(filePath, code);
      compilePython(code, action);
      res.json("Code saved and executed");
    } else if (action === "stop") {
      compilePython("", action);
      res.json("Code stopped");
    } else {
      res.status(400).json("Invalid action");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Server error");
  }
});

app.post("/run_code", async (req, res) => {
  const { action } = req.body;
  const filePath = `${PATH}${FILENAME}`;

  try {
    if (action === "run") {
      const code = await fs.readFile(filePath, "utf8");
      compilePython(code, action);
      res.json("Code read and executed");
    } else if (action === "stop") {
      compilePython("", action);
      res.json("Code stopped");
    } else {
      res.status(400).json("Invalid action");
    }
  } catch (error) {
    try {
      const code = `print("Hello World")`;
      await fs.writeFile(filePath, code);
      compilePython(code, action);
      res.json("Code saved and executed");
    } catch (error) {
      console.error(error);
      res.status(500).json("Server error");
    }
  }
});

server.listen(PORT, () => {
  serverStartTime = performance.now();
  console.log(`Server running at http://localhost:${PORT}`);
});
