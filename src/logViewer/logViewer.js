const LogViewer = () => {
  const [logs, setLogs] = React.useState([]);
  const [stopTimestamp, setStopTimestamp] = React.useState(Infinity);
  const logContainerRef = React.useRef(null);

  React.useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("logUpdate", ({ timestamp, message }) => {
      console.log(`timestamp:${timestamp}, stopTimestamp:${stopTimestamp}`);
      if (timestamp <= stopTimestamp) {
        setLogs((prevLogs) => [...prevLogs, { timestamp, message }]);
      }
    });

    socket.on("clearLogs", () => {
      setLogs([]);
      setStopTimestamp(Infinity);
    });

    socket.on("stop", ({ stopTimestamp }) => {
      setStopTimestamp(stopTimestamp);
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop =
          logContainerRef.current.scrollHeight;
      }
    });

    return () => socket.disconnect();
  }, [stopTimestamp]);

  React.useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleAction = (action) => {
    fetch("http://localhost:3000/run_code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: action,
        code: "", // Replace with actual code when running
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div>
      <div className="button-container">
        <button onClick={() => handleAction("run")}>Run</button>
        <button onClick={() => handleAction("stop")}>Stop</button>
      </div>
      <h1>Python Log Viewer</h1>
      <div id="log-container" ref={logContainerRef}>
        {logs.length === 0 ? (
          <div>Waiting for logs...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index}>
              {`[${log.timestamp.toFixed(3)}ms] ${log.message}`}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

ReactDOM.render(<LogViewer />, document.getElementById("root"));
