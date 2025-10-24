import React, { useState } from "react";

const PlataformaGestionProductos = ({ productos, agregarProducto }) => {
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: "", precio: "" });

  const handleInputChange = (e) => {
    setNuevoProducto({ ...nuevoProducto, [e.target.name]: e.target.value });
  };

  const handleAgregarProducto = () => {
    if (nuevoProducto.nombre && nuevoProducto.precio) {
      agregarProducto(nuevoProducto);
      setNuevoProducto({ nombre: "", precio: "" });
    }
  };

  return (
    <div className="plataforma-gestion">
      <h2>Gestión de Productos</h2>
      <input
        type="text"
        name="nombre"
        placeholder="Nombre del producto"
        value={nuevoProducto.nombre}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="precio"
        placeholder="Precio"
        value={nuevoProducto.precio}
        onChange={handleInputChange}
      />
      <button onClick={handleAgregarProducto}>Agregar Producto</button>

      <h3>Productos existentes</h3>
      <ul>
        {productos.map((prod) => (
          <li key={prod.id}>{prod.nombre} - ${prod.precio}</li>
        ))}
      </ul>
    </div>
  );
};

export default PlataformaGestionProductos;
