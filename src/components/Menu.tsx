function Menu({setName}: {setName: any}) {
  return (
    <div className="menu">
      <button className="menu_button" onClick={() => setName("transfer")}>
        transfer
      </button>
      <button className="menu_button" onClick={() => setName("cannon")}>
        cannon
      </button>
      <button className="menu_button" onClick={() => setName("lerp")}>
        lerp
      </button>
      <button className="menu_button" onClick={() => setName("raycaster")}>
        raycaster
      </button>
      <button className="menu_button" onClick={() => setName("loader")}>
        loader
      </button>
    </div>
  );
}

export default Menu;
