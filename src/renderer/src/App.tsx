import { useEffect, useState } from "react";

function App() {

  const [ text, setText ] = useState("");
  const [ ipArray, setIpArray ] = useState<string[]>([]);
  const [ results, setResults ] = useState<string[]>([]);
  const [ tasks, setTasks ] = useState<({index: number, task: () => Promise<string>})[]>([]);
  const [ disableGo, setDisableGo ] = useState(false);
  const [ cancel, setCancel ] = useState(false);

  const buttonStyle = {
    // padding: 10,
    // margin: 4,
    // borderRadius: 5,
    // border: "none",
    // backgroundColor: "#9feaf9",
  };


  useEffect(() => {
    // (async() => {
    setCancel(false);
    const _results = new Array(ipArray.length).fill("WAITING");
    console.log(_results);
    setResults(_results);


    const promises: ({index: number, task: () => Promise<string>})[] = [];
    for (const i in ipArray) {
      promises.push({index: +i, task: () => window.electron.ping(ipArray[i])});
    }

    setTasks(promises);

  },[ipArray]);

  useEffect(() => {
    if (cancel) {
      setDisableGo(false);
      const _results = [...results];
      setResults(_results.map((x) => {
        if (x === "WAITING") return "CANCELLED";
        else return x;
      }));
      return;
    }
    if (tasks.length === 0) {
      setDisableGo(false);
      setCancel(false);
    } else {
      setDisableGo(true);

      console.log("tasks");
      const _results = [...results];
      (async() => {
        const i = tasks[0].index;
        try {
          _results[i] = "TESTING";
          setResults([..._results]);
          const x = await tasks[0].task();
          console.log(x, i);
          _results[i] = "OK";
          setResults([..._results]);
        } catch (e) {
          _results[i] = "ERROR";
          setResults([..._results]);
          console.error(e);
        } finally {
          const _tasks = [...tasks];
          _tasks.shift();
          setTasks(_tasks);
        }

      })();
    }
  }, [tasks, cancel]);


  async function handleGo() {
    const lines = text.trim().split("\n");
    setIpArray(lines);
  }

  function handleCopy() {
    let copyText = "";

    for (const i in results) {
      if (results[i] === "OK") {
        copyText += ipArray[i] + "\n";
      }
    }

    console.log(copyText);
    navigator.clipboard.writeText(copyText);
  }


  return (
    <div className="container" style={{display: "flex", flexDirection: "row"}}>
      <div style={{margin: 10}}>
        <div>
          <textarea style={{padding: 10, resize: "none", backgroundColor: "#000000", color: "#86a5b1"}} rows={30} cols={30} value={text} onChange={(e) => setText(e.target.value)}></textarea>
        </div>
        <div style={{display: "flex", justifyContent: "center", marginTop: "10px"}}>
          <button style={buttonStyle} disabled={disableGo} onClick={handleGo}>Go</button>
          <button style={buttonStyle} disabled={!disableGo} onClick={() => setCancel(true)}>Cancel</button>
          <button style={buttonStyle} disabled={disableGo} onClick={handleCopy}>Copy to Clipboard</button>
        </div>
      </div>
      <div style={{backgroundColor: "#000000", border: "1px solid #ffffff55",width: 800, margin: 10, padding: 10, height: 520, overflow: "scroll"}}>
        <pre>
          {
            ipArray.map((ip, i) => {
              return <p key={i}>{ip}{" "}
                {results[i] === "OK" &&
                  <span style={{color: "#00ff00"}}>
                    {results[i]}
                  </span>
                }
                {results[i] === "ERROR" &&
                  <span style={{color: "#ff0000"}}>
                    {results[i]}
                  </span>
                }
                {results[i] === "TESTING" &&
                  <span style={{color: "#ffff00"}}>
                    {results[i]}
                  </span>
                }
                {results[i] === "WAITING" &&
                  <span style={{color: "#0000ff"}}>
                    {results[i]}
                  </span>
                }
                {results[i] === "CANCELLED" &&
                  <span style={{color: "#ff4400"}}>
                    {results[i]}
                  </span>
                }

              </p>;
            })
          }

        </pre>
      </div>
    </div>
  );
}

export default App;
