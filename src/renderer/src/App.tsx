import { useEffect, useState } from "react";

function App(): JSX.Element {

  const [ text, setText ] = useState("2001:4860:4860::8888");
  const [ ipArray, setIpArray ] = useState<string[]>([]);
  const [ results, setResults ] = useState<string[]>([]);
  const [ tasks, setTasks ] = useState<({index: number, task: () => Promise<string>})[]>([]);
  const [ disableGo, setDisableGo ] = useState(false);
  const [ cancel, setCancel ] = useState(false);


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

    // for (const i in promises) {
    //   _results[i] = "TESTING";
    //   setResults([..._results]);
    //   try {
    //     const x = await promises[i]();
    //     console.log(x, i);
    //     _results[i] = "OK";
    //     setResults([..._results]);
    //   } catch (e) {
    //     _results[i] = "ERROR";
    //     setResults([..._results]);
    //     console.error(e);
    //   }
    // }

    // setDisableGo(false);
    // })();

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

  // useEffect(() => {
  //   if (cancel) {
  //     console.log("cancel");
  //     setTasks([]);
  //   }
  // },[cancel]);

  async function handleGo() {
    const lines = text.trim().split("\n");
    setIpArray(lines);
  }


  return (
    <div className="container" style={{display: "flex", flexDirection: "row", border: "1px solid white"}}>
      <div>
        <textarea rows={30} value={text} onChange={(e) => setText(e.target.value)}></textarea>
        <button disabled={disableGo} onClick={handleGo}>Go</button>
        <button disabled={!disableGo} onClick={() => setCancel(true)}>Cancel</button>
      </div>
      <div style={{backgroundColor: "#000000", width: 800, margin: 10}}>
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
