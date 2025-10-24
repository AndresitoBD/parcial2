import React from "react";

const PlataformaEstadisticas = ({ pedidos }) => {
  const totalPedidos = pedidos.length;
  const pedidosEnviados = pedidos.filter((p) => p.estado === "Enviado").length;

  return (
    <div className="plataforma-estadisticas">
      <h2>Estadísticas</h2>
      <p>Total de pedidos: {totalPedidos}</p>
      <p>Pedidos enviados: {pedidosEnviados}</p>
    </div>
  );
};

export default PlataformaEstadisticas;
