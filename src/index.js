import * as Blockly from "blockly";
import { blocks } from "./blocks/text";
import { pythonGenerator } from "./generators/python";
import { save, load } from "./serialization";
import { toolbox } from "./toolbox";
import "./index.css";

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById("generatedCode").firstChild;
const serverResponse = document.getElementById("serverResponse");
const blocklyDiv = document.getElementById("blocklyDiv");
const runButton = document.getElementById("runButton");
const stopButton = document.getElementById("stopButton");
const ws = Blockly.inject(blocklyDiv, { toolbox });

// This function updates the generated code display
const updateCode = () => {
  const code = pythonGenerator.workspaceToCode(ws);
  codeDiv.textContent = code;
};

function handleCode(event, action) {
  let body = { action: action };
  if (action === "run") {
    const code = pythonGenerator.workspaceToCode(ws);
    body.code = code;
  }

  fetch("http://localhost:3000/save_code", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Server response:", data);
      serverResponse.textContent = JSON.stringify(data, null, 2);
    })
    .catch((error) => {
      console.error("Error:", error);
      serverResponse.textContent = "Error: " + error.message;
    });
}

// Function to check server reachability
function checkServerReachability() {
  fetch("http://localhost:3000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}), // Empty object as body
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Server is reachable. Response:", data);
      serverResponse.textContent =
        "Server is reachable: " + JSON.stringify(data, null, 2);
    })
    .catch((error) => {
      console.error("Server is not reachable:", error);
      serverResponse.textContent = "Server is not reachable: " + error.message;
    });
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", checkServerReachability);

// Add event listener for the run button
runButton.addEventListener("click", (event) => handleCode(event, "run"));
stopButton.addEventListener("click", (event) => handleCode(event, "stop"));

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
