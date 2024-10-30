import {useState} from "react";
import Lerp from "./components/lerp";
import Menu from "./components/Menu";
import Move from "./components/Move";
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
    </>
  );
}

export default App;
