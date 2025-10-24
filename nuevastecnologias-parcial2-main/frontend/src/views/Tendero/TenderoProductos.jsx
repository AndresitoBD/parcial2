import React from "react";
import { PlusCircle } from "lucide-react";

const TenderoProductos = ({
  productosDisponibles,
  tenderoPedido,
  setTenderoPedido,
  realizarPedido,
}) => {
  const agregarProducto = (producto) => {
    setTenderoPedido([
      ...tenderoPedido,
      { ...producto, cantidad: 1 }
    ]);
  };

  return (
    <div className="tendero-productos">
      <h2>Productos Disponibles</h2>
      <ul>
        {productosDisponibles.map((producto) => (
          <li key={producto.id}>
            {producto.nombre} - ${producto.precio}
            <button onClick={() => agregarProducto(producto)}>
              <PlusCircle size={16} /> Agregar
            </button>
          </li>
        ))}
      </ul>

      {tenderoPedido.length > 0 && (
        <button onClick={realizarPedido}>Realizar Pedido</button>
      )}
    </div>
  );
};

export default TenderoProductos;
