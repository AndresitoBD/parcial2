import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PedidosPage from './PedidosPage.jsx';
import ConsolidacionPage from './ConsolidacionPage.jsx';
import ProveedorPage from './ProveedorPage.jsx';
import ProductosPage from './ProductosPage.jsx';


function DashboardPage() {
  const { user } = useAuth();

  const renderContent = () => {
    switch (user.role) {
      case 'tendero':
        return <PedidosPage />;
      case 'plataforma':
        return (
          <div>
            <ConsolidacionPage />
            <ProductosPage />
          </div>
        );
      case 'proveedor':
        return <ProveedorPage />;
      default:
        return <p>Rol no reconocido.</p>;
    }
  };

  return (
    <div className="page">
      <Navbar />
      {renderContent()}
    </div>
  );
}

export default DashboardPage;