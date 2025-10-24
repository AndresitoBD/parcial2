import React from "react";

const PlataformaPedidos = ({ pedidos, cambiarEstadoPedido }) => {
  return (
    <div className="plataforma-pedidos">
      <h2>Gestión de Pedidos</h2>
      <ul>
        {pedidos.map((pedido) => (
          <li key={pedido.id}>
            Pedido #{pedido.id} - Estado: {pedido.estado}
            <button onClick={() => cambiarEstadoPedido(pedido.id, "Enviado")}>
              Marcar como Enviado
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlataformaPedidos;
