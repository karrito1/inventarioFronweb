
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Table from '@/components/Table';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getInventario, createMovimiento, getProductos } from '@/services/api';
import { toast } from 'sonner';

const InventarioPage = () => {
  const [activeTab, setActiveTab] = useState('registrar');
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    producto: '',
    tipo: '',
    cantidad: '',
    observaciones: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const [movimientosData, productosData] = await Promise.all([
        getInventario(),
        getProductos(),
      ]);
      setMovimientos(movimientosData);
      setProductos(productosData);
    } catch (error) {
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.producto) {
      newErrors.producto = 'El producto es requerido';
    }
    if (!formData.tipo) {
      newErrors.tipo = 'El tipo de movimiento es requerido';
    }
    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setSubmitting(true);
    
    try {
      await createMovimiento(formData);
      toast.success('Movimiento registrado correctamente');
      setFormData({ producto: '', tipo: '', cantidad: '', observaciones: '' });
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Error al registrar el movimiento');
    } finally {
      setSubmitting(false);
    }
  };
  
  const columns = [
    { key: 'producto', label: 'Producto', sortable: true },
    { key: 'tipo', label: 'Tipo', sortable: true },
    { key: 'cantidad', label: 'Cantidad', sortable: true },
    { key: 'fecha', label: 'Fecha', sortable: true },
    { key: 'observaciones', label: 'Observaciones' },
  ];
  
  return (
    <>
      <Helmet>
        <title>Inventario - InventoryPro</title>
        <meta name="description" content="Gestión de movimientos de inventario" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Inventario</h1>
            <p className="text-muted-foreground text-lg">
              Registra y consulta movimientos de inventario
            </p>
          </div>
          
          <div className="bg-card rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-border">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('registrar')}
                  className={`px-6 py-4 font-medium transition-all duration-200 ${
                    activeTab === 'registrar'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Registrar Movimiento
                </button>
                <button
                  onClick={() => setActiveTab('historial')}
                  className={`px-6 py-4 font-medium transition-all duration-200 ${
                    activeTab === 'historial'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Historial
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {activeTab === 'registrar' ? (
                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                  <Select
                    label="Producto"
                    name="producto"
                    value={formData.producto}
                    onChange={handleChange}
                    error={errors.producto}
                    options={productos.map(p => ({ value: p.id, label: p.nombre }))}
                    required
                  />
                  
                  <Select
                    label="Tipo de Movimiento"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    error={errors.tipo}
                    options={[
                      { value: 'entrada', label: 'Entrada' },
                      { value: 'salida', label: 'Salida' },
                    ]}
                    required
                  />
                  
                  <Input
                    label="Cantidad"
                    name="cantidad"
                    type="number"
                    value={formData.cantidad}
                    onChange={handleChange}
                    error={errors.cantidad}
                    required
                  />
                  
                  <div className="w-full">
                    <label className="block text-sm font-medium mb-2">
                      Observaciones
                    </label>
                    <textarea
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleChange}
                      rows={4}
                      className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Notas adicionales sobre el movimiento..."
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                  >
                    Registrar Movimiento
                  </Button>
                </form>
              ) : (
                loading ? (
                  <LoadingSpinner rows={5} />
                ) : (
                  <Table columns={columns} data={movimientos} />
                )
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default InventarioPage;
