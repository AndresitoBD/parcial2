import React from "react";

const PlataformaNavbar = ({ setVista }) => {
  return (
    <nav className="navbar-plataforma">
      <button onClick={() => setVista("plataforma_pedidos")}>Pedidos</button>
      <button onClick={() => setVista("plataforma_gestion")}>Gestión Productos</button>
      <button onClick={() => setVista("plataforma_estadisticas")}>Estadísticas</button>
    </nav>
  );
};

export default PlataformaNavbar;
