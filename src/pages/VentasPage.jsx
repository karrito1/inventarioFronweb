import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Plus, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  getVentas,
  createVenta,
  getClientes,
  getProductos,
} from "@/services/api";
import { toast } from "sonner";

const VentasPage = () => {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    cliente: "",
    items: [],
  });
  const [currentItem, setCurrentItem] = useState({
    producto: "",
    cantidad: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ventasData, clientesData, productosData] = await Promise.all([
        getVentas(),
        getClientes(),
        getProductos(),
      ]);
      setVentas(ventasData);
      setClientes(clientesData);
      setProductos(productosData);
    } catch (error) {
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleClienteChange = (e) => {
    setFormData((prev) => ({ ...prev, cliente: e.target.value }));
    if (errors.cliente) {
      setErrors((prev) => ({ ...prev, cliente: "" }));
    }
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    if (
      !currentItem.producto ||
      !currentItem.cantidad ||
      currentItem.cantidad <= 0
    ) {
      toast.error("Selecciona un producto y cantidad válida");
      return;
    }

    const producto = productos.find(
      (p) => p.id === Number(currentItem.producto),
    );

    if (!producto) {
      toast.error("Producto no encontrado");
      return;
    }

    const subtotal = producto.precio * parseFloat(currentItem.cantidad);

    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          producto: currentItem.producto,
          productoNombre: producto.nombre,
          cantidad: parseFloat(currentItem.cantidad),
          precio: producto.precio,
          subtotal,
        },
      ],
    }));

    setCurrentItem({ producto: "", cantidad: "" });
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.cliente) {
      newErrors.cliente = "Selecciona un cliente";
    }
    if (formData.items.length === 0) {
      newErrors.items = "Agrega al menos un producto";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      await createVenta({
        cliente: formData.cliente,
        items: formData.items,
        total: calculateTotal(),
      });
      toast.success("Venta registrada correctamente");
      setFormData({ cliente: "", items: [] });
      fetchData();
    } catch (error) {
      toast.error(error.message || "Error al registrar la venta");
    } finally {
      setSubmitting(false);
    }
  };

  const ventasColumns = [
    { key: "cliente", label: "Cliente", sortable: true },
    { key: "fecha", label: "Fecha", sortable: true },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (row) => `$${row.total.toLocaleString()}`,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Ventas - InventoryPro</title>
        <meta name="description" content="Registro y gestión de ventas" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Ventas</h1>
            <p className="text-muted-foreground text-lg">
              Registra nuevas ventas y consulta el historial
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-semibold mb-6">Nueva Venta</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Select
                    label="Cliente"
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleClienteChange}
                    error={errors.cliente}
                    options={clientes.map((c) => ({
                      value: c.id,
                      label: c.nombre,
                    }))}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium mb-4">
                      Productos
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <Select
                        placeholder="Seleccionar producto"
                        name="producto"
                        value={currentItem.producto}
                        onChange={handleItemChange}
                        options={productos.map((p) => ({
                          value: p.id,
                          label: p.nombre,
                        }))}
                      />
                      <Input
                        placeholder="Cantidad"
                        name="cantidad"
                        type="number"
                        value={currentItem.cantidad}
                        onChange={handleItemChange}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={addItem}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </div>

                    {formData.items.length > 0 && (
                      <div className="border border-border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold">
                                Producto
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">
                                Cantidad
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">
                                Precio
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">
                                Subtotal
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {formData.items.map((item, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3 text-sm">
                                  {item.productoNombre}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {item.cantidad}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  ${item.precio.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  ${item.subtotal.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(index)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {errors.items && (
                      <p className="mt-2 text-sm text-destructive">
                        {errors.items}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={submitting}
                    className="w-full"
                  >
                    Registrar Venta
                  </Button>
                </form>
              </div>
            </div>

            <div>
              <div className="bg-card rounded-xl p-6 shadow-sm sticky top-24">
                <h3 className="text-xl font-semibold mb-6">Resumen</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      ${calculateTotal().toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-muted-foreground">Impuestos</span>
                    <span className="font-medium">$0</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ${calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">Ventas Recientes</h2>
            {loading ? (
              <LoadingSpinner rows={5} />
            ) : (
              <Table columns={ventasColumns} data={ventas} />
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default VentasPage;
