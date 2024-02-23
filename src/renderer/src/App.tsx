
function App(): JSX.Element {

  async function handleGo() {
    const response = await window.electron.ping("10.0.0.3");
    console.log(response);
  }


  return (
    <div className="container">
      <textarea rows={10}></textarea>
      <button onClick={handleGo}>Go</button>
    </div>
  );
}

export default App;
