import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Lock } from "lucide-react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { login } from "@/services/api";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    correo: "",
    contraseña: "",
    codigo2FA: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.correo) {
      newErrors.correo = "El correo es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = "El correo no es válido";
    }

    if (!formData.contraseña) {
      newErrors.contraseña = "La contraseña es requerida";
    } else if (formData.contraseña.length < 6) {
      newErrors.contraseña = "La contraseña debe tener al menos 6 caracteres";
    }

    if (formData.codigo2FA && !/^\d{6}$/.test(formData.codigo2FA)) {
      newErrors.codigo2FA = "El código debe tener 6 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await login(
        formData.correo,
        formData.contraseña,
        formData.codigo2FA,
      );

      localStorage.setItem("authToken", response.token);
      toast.success("Inicio de sesión exitoso");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Iniciar sesión - InventoryPro</title>
        <meta
          name="description"
          content="Inicia sesión en tu cuenta de InventoryPro"
        />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-lg p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="h-16 w-16 rounded-xl bg-primary flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Bienvenido</h1>
              <p className="text-muted-foreground text-center">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Correo electrónico"
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                error={errors.correo}
                placeholder="tu@correo.com"
                required
              />

              <Input
                label="Contraseña"
                type="password"
                name="contraseña"
                value={formData.contraseña}
                onChange={handleChange}
                error={errors.contraseña}
                placeholder="••••••••"
                required
              />
{/*
              <Input
                label="Código 2FA"
                type="text"
                name="codigo2FA"
                value={formData.codigo2FA}
                onChange={handleChange}
                error={errors.codigo2FA}
                placeholder="123456"
                maxLength={6}
                required
              />
  */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Iniciar sesión
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
