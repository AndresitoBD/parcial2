const Zona = require('../models/Zona');

// Obtener todas las zonas
const getZonas = async (req, res) => {
  try {
    const zonas = await Zona.findAll();
    
    res.json({
      message: 'Zonas obtenidas exitosamente',
      data: zonas,
      total: zonas.length
    });
  } catch (error) {
    console.error('Error obteniendo zonas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las zonas'
    });
  }
};

module.exports = {
  getZonas
};