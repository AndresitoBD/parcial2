import React from "react";

const TenderoNavbar = ({ setVista }) => {
  return (
    <nav className="navbar-tendero">
      <button onClick={() => setVista("productos")}>Productos</button>
      <button onClick={() => setVista("pedidos")}>Pedidos</button>
    </nav>
  );
};

export default TenderoNavbar;
