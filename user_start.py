import subprocess
import os
import platform
import webbrowser

def run_parallel_commands():
    # Get the current working directory
    current_dir = os.getcwd()
    
    # Open logViewer.html in the default browser
    logviewer_path = os.path.join(current_dir, 'src/logViewer/logViewer.html')
    webbrowser.open(f'file://{logviewer_path}')
    
    if platform.system() == "Darwin":  # macOS
        commands = [
            f'osascript -e \'tell application "Terminal" to do script "cd {current_dir} && node src/logViewer/saveCode.js"\' ',
            f'osascript -e \'tell application "Terminal" to do script "cd {current_dir} && npm start"\' '
        ]
        for cmd in commands:
            subprocess.Popen(cmd, shell=True)
    elif platform.system() == "Windows":
        commands = [
            f'start cmd /k "cd /d {current_dir} && node src/logViewer/saveCode.js"',
            f'start cmd /k "cd /d {current_dir} && npm start"'
        ]
        for cmd in commands:
            subprocess.Popen(cmd, shell=True)
    else:  # Linux and other Unix-like systems
        try:
            commands = [
                f'gnome-terminal --working-directory="{current_dir}" -- bash -c "node src/logViewer/saveCode.js; bash"',
                f'gnome-terminal --working-directory="{current_dir}" -- bash -c "npm start; bash"'
            ]
            for cmd in commands:
                subprocess.Popen(cmd, shell=True)
        except:
            commands = [
                f'xterm -e "cd {current_dir} && node src/logViewer/saveCode.js" &',
                f'xterm -e "cd {current_dir} && npm start" &'
            ]
            for cmd in commands:
                subprocess.Popen(cmd, shell=True)

if __name__ == "__main__":
    run_parallel_commands()