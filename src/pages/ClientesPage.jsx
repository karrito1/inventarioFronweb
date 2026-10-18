
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import Input from '@/components/Input';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getClientes, createCliente, updateCliente, deleteCliente } from '@/services/api';
import { toast } from 'sonner';

const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    documento: '',
    telefono: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchClientes();
  }, []);
  
  const fetchClientes = async () => {
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (error) {
      toast.error('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenModal = (cliente = null) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombre: cliente.nombre,
        documento: cliente.documento,
        telefono: cliente.telefono,
      });
    } else {
      setEditingCliente(null);
      setFormData({ nombre: '', documento: '', telefono: '' });
    }
    setErrors({});
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCliente(null);
    setFormData({ nombre: '', documento: '', telefono: '' });
    setErrors({});
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
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.documento.trim()) {
      newErrors.documento = 'El documento es requerido';
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setSubmitting(true);
    
    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, formData);
        toast.success('Cliente actualizado correctamente');
      } else {
        await createCliente(formData);
        toast.success('Cliente creado correctamente');
      }
      
      handleCloseModal();
      fetchClientes();
    } catch (error) {
      toast.error(error.message || 'Error al guardar el cliente');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    
    try {
      await deleteCliente(id);
      toast.success('Cliente eliminado correctamente');
      fetchClientes();
    } catch (error) {
      toast.error('Error al eliminar el cliente');
    }
  };
  
  const columns = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'documento', label: 'Documento', sortable: true },
    { key: 'telefono', label: 'Teléfono', sortable: true },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];
  
  return (
    <>
      <Helmet>
        <title>Clientes - InventoryPro</title>
        <meta name="description" content="Gestión de clientes" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Clientes</h1>
              <p className="text-muted-foreground text-lg">
                Administra tu base de clientes
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Cliente
            </Button>
          </div>
          
          {loading ? (
            <LoadingSpinner rows={5} />
          ) : (
            <Table columns={columns} data={clientes} />
          )}
        </main>
      </div>
      
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingCliente ? 'Editar Cliente' : 'Agregar Cliente'}
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={submitting}
            >
              {editingCliente ? 'Actualizar' : 'Crear'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            error={errors.nombre}
            required
          />
          <Input
            label="Documento"
            name="documento"
            value={formData.documento}
            onChange={handleChange}
            error={errors.documento}
            required
          />
          <Input
            label="Teléfono"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={handleChange}
            error={errors.telefono}
            required
          />
        </form>
      </Modal>
    </>
  );
};

export default ClientesPage;
