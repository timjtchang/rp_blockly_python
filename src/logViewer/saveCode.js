const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { spawn } = require("child_process");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const { performance } = require("perf_hooks");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

const PATH = "../../generatedCode/";
const VENVPATH = "../../myenv/bin/python3";
let currentProcess = null;
let serverStartTime;

function emitLog(message) {
  const timestamp = performance.now() - serverStartTime;
  console.log({ timestamp, message });
  io.emit("logUpdate", { timestamp, message });
}

function compilePython(code, action) {
  if (action === "run") {
    // Clear previous logs only when running new code
    io.emit("clearLogs");

    // Spawn a new process to run the Python file
    currentProcess = spawn(VENVPATH, ["-u", `${PATH}python_code.py`]);
    console.log(`init: ${currentProcess.pid}`);

    // Handle the output
    currentProcess.stdout.on("data", (data) => {
      emitLog(`${data}`);
    });

    // Handle errors
    currentProcess.stderr.on("data", (data) => {
      emitLog(`Error: ${data}`);
    });

    // Handle process exit
    currentProcess.on("exit", (code) => {
      emitLog(`Process exited with code ${code}`);
      currentProcess = null;
    });
  } else if (action === "stop") {
    console.log(`stop: ${currentProcess.pid}`);
    if (currentProcess) {
      currentProcess.kill("SIGKILL");
      //const stopTimestamp = performance.now() - serverStartTime;
      //io.emit("stop", { stopTimestamp });
      currentProcess = null;
    } else {
      emitLog("No running process to stop");
    }
  }
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("."));

app.post("/", (req, res) => {
  res.json({
    message: "ok",
  });
});

app.post("/save_code", (req, res) => {
  const action = req.body.action;
  const filename = PATH + "python_code.py";

  if (action === "run") {
    const code = req.body.code;
    fs.writeFile(filename, code, (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save the file" });
      } else {
        compilePython(code, action);
        res.json({
          message: `Code ${
            action === "run" ? "saved and executed" : "stopped"
          }`,
        });
      }
    });
  } else {
    compilePython("", action);
  }
});

app.post("/run_code", (req, res) => {
  const action = req.body.action;
  const filename = PATH + "python_code.py";

  console.log("run code request");

  if (action === "run") {
    fs.readFile(filename, "utf8", (err, code) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to read the file" });
      } else {
        compilePython(code, action);
        res.json({
          message: "Code read and executed",
        });
      }
    });
  } else if (action === "stop") {
    compilePython("", action);
    res.json({
      message: "Code stopped",
    });
  } else {
    res.status(400).json({ error: "Invalid action" });
  }
});

server.listen(port, () => {
  serverStartTime = performance.now();
  console.log(`Server running at http://localhost:${port}`);
});
