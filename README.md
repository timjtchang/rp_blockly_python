# RP Blockly Python

RP Blockly Python is a sophisticated web-based visual programming environment that allows users to create Python code using Google's Blockly library. This project combines Blockly's intuitive drag-and-drop interface with Python code generation, execution, and real-time log viewing, offering a unique development experience for both beginners and experienced programmers.

## Key Features

- Visual programming interface using Google Blockly
- Python code generation from Blockly blocks
- Real-time code execution on a separate Python server
- Live log viewer for Python output
- Custom block support for enhanced functionality
- Ability to add custom Python libraries locally
- Offline functionality
- Responsive design for various screen sizes

## Prerequisites

- Node.js (v14 or later recommended)
- Python 3.x
- A modern web browser

## Installation

1. Clone the repository:

```
git clone https://github.com/your-username/rp_blockly_python.git
cd rp_blockly_python
```

2. Install Node.js dependencies:

```
npm install
```

3. Set up a Python virtual environment (recommended):

```
python3 -m venv myenv
source myenv/bin/activate # On Windows, use `myenv\Scripts\activate`
```

4. Install Python dependencies:

```
pip3 install -r requirements.txt
```

## Usage

There are two ways to run the application:

### Method 1: Automated Startup (For Users)

Run the following command:

```
npm run user
```

This command executes `user_start.py`, which automatically:

- Opens the logViewer.html in your default browser
- Starts the Node.js server for Blockly interface
- Launches the Python execution server

### Method 2: Manual Startup (For Developers)

1. Start the development server:

```
npm start
```

2. In a separate terminal, start the Python execution server:

```
node src/logViewer/saveCode.js
```

3. Open `src/logViewer/logViewer.html` in a web browser to view the Python execution logs.

## How to Use

### Blockly Interface

1. Open the Blockly interface in your web browser (typically at `http://localhost:8080` when running locally).
2. Use the drag-and-drop interface to create your Python program using Blockly blocks.
3. The generated Python code will be displayed in real-time in the code pane on the right side of the interface.

#### Run Button (Blockly UI)

- Located on the Blockly interface.
- When clicked, it will:
  1. Download the generated Python code from the Blockly GUI.
  2. Send the code to the Python execution server.
  3. Trigger the compilation and execution of the code.
  4. Display the output in the log viewer.

#### Stop Button (Blockly UI)

- Located on the Blockly interface.
- When clicked, it will:
  1. Send a stop signal to the Python execution server.
  2. Immediately halt the execution of the current Python program.

### Log Viewer

Open the log viewer by navigating to `src/logViewer/logViewer.html` in your web browser.

#### Run Button (Log Viewer)

- Located on the log viewer interface.
- When clicked, it will:
  1. Retrieve the most recently saved Python code.
  2. Send the code to the Python execution server.
  3. Trigger the compilation and execution of the code.
  4. Display the output in real-time in the log viewer.

#### Stop Button (Log Viewer)

- Located on the log viewer interface.
- When clicked, it will:
  1. Send a stop signal to the Python execution server.
  2. Immediately halt the execution of the current Python program.
  3. Display a "-- STOP --" message in the log viewer.

## Customization

- Add custom blocks in `src/blocks/`
- Modify the toolbox in `src/toolbox.js`
- Adjust Python code generation in `src/generators/python.js`
- Add custom Python libraries to the local environment for extended functionality

## Project Structure

- `src/`: Source files for the Blockly interface
- `blocks/`: Custom block definitions
- `generators/`: Python code generators for blocks
- `logViewer/`: Log viewer components
- `webpack.config.js`: Webpack configuration
- `package.json`: Node.js dependencies and scripts
- `requirements.txt`: Python dependencies
- `user_start.py`: Script to launch all components of the application

## Scripts

- `npm start`: Start the development server
- `npm run build`: Build the project for production
- `npm run user`: Run the user start script (executes `user_start.py`)

## License

This project is licensed under the Apache 2.0 License.

## Acknowledgments

This project uses [Google's Blockly library](https://github.com/google/blockly).
