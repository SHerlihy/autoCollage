import React, { useEffect, useState } from "react";
import "./App.css";
import screamImg from "../src/assets/img_the_scream.jpg";
import cat03 from "../src/assets/cat03.jpg";
import { Canvas } from "./canvas/Canvas";

function App() {
  const [images, setImages] = useState([screamImg]);

  return (
    <div className="App">
      <Canvas currentImages={images} />
      <button className="fillButton" onClick={() => setImages([cat03])}>
        Fill!
      </button>
    </div>
  );
}

export default App;
