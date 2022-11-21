import React, { useEffect, useRef } from "react";
import "./App.css";
import { Canvas } from "./canvas/Canvas";

import { CanvasControl } from "./canvas/CanvasControl";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>();

  return (
    <div className="App">
      <CanvasControl canvasRef={canvasRef}>
        <Canvas canvasRef={canvasRef} />
      </CanvasControl>
    </div>
  );
}

export default App;
