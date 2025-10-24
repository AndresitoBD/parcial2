import React, { useState } from 'react';
import { createProducto } from '../utils/api';
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

function ProductosPage() {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!nombre || precio <= 0) return alert('Ingresa nombre y precio válido.');
    setLoading(true);
    setError('');
    try {
      await createProducto({ nombre, precio });
      alert('Producto creado.');
      setNombre('');
      setPrecio(0);
    } catch (err) {
      setError('Error creando producto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Crear Producto</h2>
      <Input
        type="text"
        placeholder="Nombre del Producto"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <Input
        type="number"
        placeholder="Precio"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
        min="0"
        required
      />
      <Button onClick={handleCreate} disabled={loading}>Crear</Button>
      {loading && <LoadingSpinner />}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default ProductosPage;