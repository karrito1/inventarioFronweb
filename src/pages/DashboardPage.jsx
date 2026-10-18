
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Package, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Table from '@/components/Table';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getDashboard } from '@/services/api';
import { toast } from 'sonner';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchDashboard();
  }, []);
  
  const fetchDashboard = async () => {
    try {
      const response = await getDashboard();
      setData(response);
    } catch (error) {
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };
  
  const movimientosColumns = [
    { key: 'producto', label: 'Producto', sortable: true },
    { key: 'tipo', label: 'Tipo', sortable: true },
    { key: 'cantidad', label: 'Cantidad', sortable: true },
    { key: 'fecha', label: 'Fecha', sortable: true },
  ];
  
  return (
    <>
      <Helmet>
        <title>Dashboard - InventoryPro</title>
        <meta name="description" content="Panel de control del sistema de inventario" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Bienvenido</h1>
            <p className="text-muted-foreground text-lg">
              Resumen general de tu inventario y ventas
            </p>
          </div>
          
          {loading ? (
            <LoadingSpinner type="metrics" />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card
                  title="Total de Productos"
                  value={data?.totalProductos || '0'}
                  subtitle="En inventario"
                  icon={Package}
                />
                <Card
                  title="Bajo Stock"
                  value={data?.bajoStock || '0'}
                  subtitle="Productos con stock bajo"
                  icon={AlertTriangle}
                />
                <Card
                  title="Ventas del Día"
                  value={`$${data?.ventasDelDia?.toLocaleString() || '0'}`}
                  subtitle="Ingresos de hoy"
                  icon={TrendingUp}
                />
                <Card
                  title="Movimientos Recientes"
                  value={data?.movimientosRecientes?.length || '0'}
                  subtitle="Últimas 24 horas"
                  icon={Activity}
                />
              </div>
              
              <div className="bg-card rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-semibold mb-6">Movimientos Recientes</h2>
                <Table
                  columns={movimientosColumns}
                  data={data?.movimientosRecientes || []}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default DashboardPage;
