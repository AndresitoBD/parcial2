// src/views/Tendero/RealizarPedido.jsx
import React, { useState, useEffect } from 'react';
import { getAvailableProducts, createNewOrder } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function RealizarPedido() {
    const { user, token } = useAuth();
    const [products, setProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getAvailableProducts();
                setProducts(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    const handleQuantityChange = (productId, price) => (e) => {
        const cantidad = parseInt(e.target.value, 10);
        setSelectedItems(prev => ({
            ...prev,
            [productId]: { 
                cantidad: cantidad > 0 ? cantidad : 0, 
                precio: price 
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const items = Object.keys(selectedItems)
            .filter(id => selectedItems[id].cantidad > 0)
            .map(id => ({ 
                productoId: parseInt(id), 
                cantidad: selectedItems[id].cantidad, 
                precioUnitario: selectedItems[id].precio 
            }));
        
        if (items.length === 0) {
            alert('Debe seleccionar al menos un producto.');
            return;
        }

        const pedidoData = { 
            tenderoId: user.id, // Asumiendo que el usuario logueado es el tendero
            items: items 
        };

        try {
            await createNewOrder(pedidoData, token);
            alert('Pedido realizado con éxito. Su estado inicial es "Pendiente".');
            setSelectedItems({});
        } catch (error) {
            alert(`Error al crear pedido: ${error.message}`);
        }
    };

    if (loading) return <div>Cargando productos...</div>;

    return (
        <div className="pedido-container">
            <h2>Realizar Nuevo Pedido</h2>
            <form onSubmit={handleSubmit}>
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Precio Unitario</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>${product.price}</td>
                                <td>
                                    <input
                                        type="number"
                                        min="0"
                                        value={selectedItems[product.id]?.cantidad || 0}
                                        onChange={handleQuantityChange(product.id, product.price)}
                                        style={{ width: '80px' }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button type="submit" disabled={!user.id}>Confirmar Pedido</button>
            </form>
        </div>
    );
}

export default RealizarPedido;