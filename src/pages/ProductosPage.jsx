import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Table from "@/components/Table";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  getProductos,
  getCategorias,
  createProducto,
  updateProducto,
  deleteProducto,
} from "@/services/api";
import { toast } from "sonner";

const ProductosPage = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    stock: "",
    precio: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productosData, categoriasData] = await Promise.all([
        getProductos(),
        getCategorias(),
      ]);
      setProductos(Array.isArray(productosData) ? productosData : []);
      setCategorias(categoriasData);
    } catch (error) {
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (producto = null) => {
    if (producto) {
      setEditingProducto(producto);
      setFormData({
        nombre: producto.nombre,
        categoria: producto.categoria,
        stock: producto.stock,
        precio: producto.precio,
      });
    } else {
      setEditingProducto(null);
      setFormData({ nombre: "", categoria: "", stock: "", precio: "" });
    }
    setErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProducto(null);
    setFormData({ nombre: "", categoria: "", stock: "", precio: "" });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }
    if (!formData.categoria) {
      newErrors.categoria = "La categoría es requerida";
    }
    if (!formData.stock || formData.stock < 0) {
      newErrors.stock = "El stock debe ser un número positivo";
    }
    if (!formData.precio || formData.precio <= 0) {
      newErrors.precio = "El precio debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      if (editingProducto) {
        await updateProducto(editingProducto.id, formData);
        toast.success("Producto actualizado correctamente");
      } else {
        await createProducto(formData);
        toast.success("Producto creado correctamente");
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error(error.message || "Error al guardar el producto");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      await deleteProducto(id);
      toast.success("Producto eliminado correctamente");
      fetchData();
    } catch (error) {
      toast.error("Error al eliminar el producto");
    }
  };

  const filteredProductos = productos.filter((producto) => {
    const matchesSearch = (producto.nombre || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategoria =
      !filterCategoria || producto.categoria === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

  const columns = [
    { key: "nombre", label: "Nombre", sortable: true },
    { key: "categoria", label: "Categoría", sortable: true },
    { key: "stock", label: "Stock", sortable: true },
    {
      key: "precio",
      label: "Precio",
      sortable: true,
      render: (row) => `$${row.precio.toLocaleString()}`,
    },
    {
      key: "acciones",
      label: "Acciones",
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
        <title>Productos - InventoryPro</title>
        <meta
          name="description"
          content="Gestión de productos del inventario"
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Productos</h1>
              <p className="text-muted-foreground text-lg">
                Gestiona tu catálogo de productos
              </p>
            </div>
            <Button variant="primary" onClick={() => handleOpenModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                placeholder="Filtrar por categoría"
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                options={categorias.map((cat) => ({
                  value: cat.id,
                  label: cat.nombre,
                }))}
              />
            </div>
          </div>

          {loading ? (
            <LoadingSpinner rows={5} />
          ) : (
            <Table columns={columns} data={filteredProductos} />
          )}
        </main>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editingProducto ? "Editar Producto" : "Agregar Producto"}
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
              {editingProducto ? "Actualizar" : "Crear"}
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
          <Select
            label="Categoría"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            error={errors.categoria}
            options={categorias.map((cat) => ({
              value: cat.id,
              label: cat.nombre,
            }))}
            required
          />
          <Input
            label="Stock"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            error={errors.stock}
            required
          />
          <Input
            label="Precio"
            name="precio"
            type="number"
            step="0.01"
            value={formData.precio}
            onChange={handleChange}
            error={errors.precio}
            required
          />
        </form>
      </Modal>
    </>
  );
};

export default ProductosPage;
