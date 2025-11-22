import React, { useState } from 'react';
import {
  Box,
  Card,
  Container,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login as authLogin } from '../services/auth';

// Componentes de íconos alternativos
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const PasswordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
  </svg>
);

const LoginIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
  </svg>
);

const Login: React.FC = () => {
  const [credenciales, setCredenciales] = useState({
    usuario: '',
    contraseña: ''
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (campo: string, valor: string) => {
    setCredenciales(prev => ({
      ...prev,
      [campo]: valor
    }));
    if (error) setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    // Validaciones básicas
    if (!credenciales.usuario.trim() || !credenciales.contraseña.trim()) {
      setError('Por favor ingrese usuario y contraseña');
      setCargando(false);
      return;
    }

    try {
      const respuesta = await authLogin(credenciales.usuario, credenciales.contraseña);
      // Guardar token y datos de usuario
      localStorage.setItem('access_token', respuesta.access_token);
      localStorage.setItem('usuarioAutenticado', 'true');
      localStorage.setItem('usuarioEmail', respuesta.user.email);
      localStorage.setItem('usuarioNombre', respuesta.user.name);
      // Notificar a otros componentes
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('authStateChange'));
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundImage: 'url("/images/fondo.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3
      }}
    >
      <Container 
        maxWidth="sm" 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Card 
          sx={{ 
            p: 4, 
            width: '100%',
            maxWidth: 400,
            backgroundColor: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          {/* Logo y título */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <img
                src="/icons/Logo.png"
                alt="Logo IFN"
                style={{ width: 80, height: 80 }}
              />
            </Box>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                color: '#2E7D32',
                mb: 1
              }}
            >
              IFN Colombia
            </Typography>
            <Typography 
              variant="body1" 
              color="textSecondary"
              sx={{ mb: 1 }}
            >
              Inventario Forestal Nacional
            </Typography>
            <Typography 
              variant="body2" 
              color="textSecondary"
            >
              Inicie sesión en su cuenta
            </Typography>
          </Box>

          {/* Formulario de login */}
          <form onSubmit={handleLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Campo Usuario */}
              <TextField
                fullWidth
                label="Usuario"
                value={credenciales.usuario}
                onChange={(e) => handleChange('usuario', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <UserIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Ingrese su usuario"
                disabled={cargando}
              />

              {/* Campo Contraseña */}
              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                value={credenciales.contraseña}
                onChange={(e) => handleChange('contraseña', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PasswordIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Ingrese su contraseña"
                disabled={cargando}
              />

              {/* Mensaje de error */}
              {error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {error}
                </Alert>
              )}

              {/* Botón de ingreso */}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<LoginIcon />}
                disabled={cargando || !credenciales.usuario.trim() || !credenciales.contraseña.trim()}
                sx={{ 
                  mt: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {cargando ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </Box>
          </form>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;