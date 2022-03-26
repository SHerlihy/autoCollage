import "./App.css";
import { Canvas } from "./canvas/Canvas";
import { drawAllItems } from "./drawings/sampleDrawing";

function App() {
  return (
    <div className="App">
      <Canvas drawAllItems={drawAllItems} />
    </div>
  );
}

export default App;
