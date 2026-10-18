
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import Input from '@/components/Input';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '@/services/api';
import { toast } from 'sonner';

const CategoriasPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchCategorias();
  }, []);
  
  const fetchCategorias = async () => {
    try {
      const data = await getCategorias();
      setCategorias(data);
    } catch (error) {
      toast.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenModal = (categoria = null) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
      });
    } else {
      setEditingCategoria(null);
      setFormData({ nombre: '', descripcion: '' });
    }
    setErrors({});
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategoria(null);
    setFormData({ nombre: '', descripcion: '' });
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setSubmitting(true);
    
    try {
      if (editingCategoria) {
        await updateCategoria(editingCategoria.id, formData);
        toast.success('Categoría actualizada correctamente');
      } else {
        await createCategoria(formData);
        toast.success('Categoría creada correctamente');
      }
      
      handleCloseModal();
      fetchCategorias();
    } catch (error) {
      toast.error(error.message || 'Error al guardar la categoría');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;
    
    try {
      await deleteCategoria(id);
      toast.success('Categoría eliminada correctamente');
      fetchCategorias();
    } catch (error) {
      toast.error('Error al eliminar la categoría');
    }
  };
  
  const columns = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'descripcion', label: 'Descripción', sortable: true },
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
        <title>Categorías - InventoryPro</title>
        <meta name="description" content="Gestión de categorías de productos" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Categorías</h1>
              <p className="text-muted-foreground text-lg">
                Organiza tus productos por categorías
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => handleOpenModal()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Categoría
            </Button>
          </div>
          
          {loading ? (
            <LoadingSpinner rows={5} />
          ) : (
            <Table columns={columns} data={categorias} />
          )}
        </main>
      </div>
      
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingCategoria ? 'Editar Categoría' : 'Agregar Categoría'}
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
              {editingCategoria ? 'Actualizar' : 'Crear'}
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
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={4}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Descripción de la categoría..."
            />
          </div>
        </form>
      </Modal>
    </>
  );
};

export default CategoriasPage;
