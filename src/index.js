import * as Blockly from "blockly";
import { blocks } from "./blocks/text";
import { pythonGenerator } from "./generators/python";
import { save, load } from "./serialization";
import { toolbox } from "./toolbox";
import { io } from "socket.io-client";
import "./index.css";

// Set up WebSocket connection
const socket = io("http://localhost:3000");

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById("generatedCode").firstChild;
const outputDiv = document.getElementById("output");
const blocklyDiv = document.getElementById("blocklyDiv");
const runButton = document.getElementById("runButton");
const ws = Blockly.inject(blocklyDiv, { toolbox });

// This function updates the generated code display
const updateCode = () => {
  const code = pythonGenerator.workspaceToCode(ws);
  codeDiv.textContent = code;
};

function runCode() {
  const code = pythonGenerator.workspaceToCode(ws);

  console.log(code);

  fetch("http://localhost:3000/save_code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code: code }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      outputDiv.textContent = "Python code has been saved on the server.";
    })
    .catch((error) => {
      outputDiv.textContent = "Error saving file: " + error.message;
    });
}

// Add event listener for the run button
runButton.addEventListener("click", runCode);

// Load the initial state from storage and update the code display
load(ws);
updateCode();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  if (e.isUiEvent) return;
  save(ws);
});

// Whenever the workspace changes meaningfully, update the code display.
ws.addChangeListener((e) => {
  if (
    e.isUiEvent ||
    e.type == Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()
  ) {
    return;
  }
  updateCode();
});

// Listen for log updates from the server
socket.on("logUpdate", (logContent) => {
  // Append the new log content to the output div
  outputDiv.textContent += logContent + "\n";
});
