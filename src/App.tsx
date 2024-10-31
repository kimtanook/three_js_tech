import {useState} from "react";
import Lerp from "./components/Lerp";
import Loader from "./components/Loader";
import Menu from "./components/Menu";
import Move from "./components/Move";
import Raycaster from "./components/Raycaster";
import Sphere from "./components/Sphere";
import "./style/style.css";

function App() {
  const [name, setName] = useState("transfer");
  return (
    <>
      <Menu setName={setName} />
      {name === "transfer" && <Sphere />}
      {name === "cannon" && <Move />}
      {name === "lerp" && <Lerp />}
      {name === "raycaster" && <Raycaster />}
      {name === "loader" && <Loader />}
    </>
  );
}

export default App;
