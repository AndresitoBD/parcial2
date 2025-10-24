import React from "react";

const TenderoPedidos = ({ pedidos, marcarComoRecibido }) => {
  return (
    <div className="tendero-pedidos">
      <h2>Mis Pedidos</h2>
      <ul>
        {pedidos.map((pedido) => (
          <li key={pedido.id}>
            Pedido #{pedido.id} - Estado: {pedido.estado}
            {pedido.estado !== "Recibido" && (
              <button onClick={() => marcarComoRecibido(pedido.id)}>
                Marcar como Recibido
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TenderoPedidos;
