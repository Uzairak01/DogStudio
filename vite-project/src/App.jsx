// import { useState } from "react";
import {Canvas} from '@react-three/fiber'
import Dog from "./components/dog";
import "./App.css";

function App() {
  return <>
    <Canvas>
      <Dog /> 
    </Canvas>
  </>;
}

export default App;
