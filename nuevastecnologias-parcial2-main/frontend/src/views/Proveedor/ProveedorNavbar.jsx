import React from "react";

const ProveedorNavbar = ({ setVista }) => {
  return (
    <nav className="navbar-proveedor">
      <button onClick={() => setVista("proveedor_pedidos")}>Pedidos Recibidos</button>
    </nav>
  );
};

export default ProveedorNavbar;
