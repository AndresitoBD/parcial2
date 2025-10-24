import React from "react";
import { Truck } from "lucide-react";

const ProveedorPedidos = ({ pedidos, aceptarPedido }) => {
  return (
    <div className="proveedor-pedidos">
      <h2>Pedidos Recibidos</h2>
      <ul>
        {pedidos.map((pedido) => (
          <li key={pedido.id}>
            Pedido #{pedido.id} - Estado: {pedido.estado}
            {pedido.estado !== "Aceptado" && (
              <button onClick={() => aceptarPedido(pedido.id)}>
                <Truck size={16} /> Aceptar Pedido
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProveedorPedidos;
