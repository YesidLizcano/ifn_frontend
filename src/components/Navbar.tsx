import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppBar, Toolbar, Button, Box, Menu, MenuItem, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const buttonStyle = {
    fontWeight: "bold",
    fontSize: "1rem",
    paddingX: 3,
    paddingY: 1,
    color: "white",
    minWidth: "120px",
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: "#077c76ff",
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Arial"',
    },
  });

  const [anchorElConglomerados, setAnchorElConglomerados] = React.useState<null | HTMLElement>(null);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);

  const navigate = useNavigate();

  // Verificar si hay un usuario autenticado al cargar el componente y escuchar cambios
  useEffect(() => {
    const checkAuth = () => {
      const usuario = localStorage.getItem('usuarioAutenticado');
      setUsuarioAutenticado(usuario === 'true');
    };

    // Verificar al cargar
    checkAuth();

    // Escuchar cambios en el localStorage y eventos personalizados
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('authStateChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('authStateChange', handleAuthChange);
    };
  }, []);

  const handleCloseConglomerados = () => setAnchorElConglomerados(null);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem('usuarioAutenticado');
    setUsuarioAutenticado(false);
    // Disparar evento para notificar el logout
    window.dispatchEvent(new Event('authStateChange'));
    navigate('/');
  };

  const handleManualIFN = () => {
    navigate("/manualIFN/visualizar");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" color="primary">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

          {/* Logo + texto */}
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            <img
              src="/icons/Logo.png"
              alt="Logo IFN"
              style={{ width: 60, height: 60, marginRight: 12 }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                whiteSpace: "pre-line",
                color: "white",
                fontSize: "1.1rem",
              }}
            >
              {"INVENTARIO FORESTAL\nNACIONAL"}
            </Typography>
          </Box>

          {/* Botones */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              flex: 2,
              gap: 1,
            }}
          >
            {/* Botón Inicio - Siempre visible */}
            <Button
              color="inherit"
              sx={buttonStyle}
              startIcon={<img src="/icons/inicio.png" width={24} height={24} style={{ filter: "invert(1)" }} />}
              onClick={() => navigate("/")}
            >
              Inicio
            </Button>

            {/* Botón Reportes - Siempre visible */}
            <Button
              color="inherit"
              sx={buttonStyle}
              startIcon={<img src="/icons/reportes.png" width={24} height={24} style={{ filter: "invert(1)" }} />}
              onClick={() => navigate("/reportes")}
            >
              Reportes
            </Button>

            {/* ---------- Botones que solo se muestran cuando está autenticado ---------- */}
            {usuarioAutenticado && (
              <>
                {/* Menú Conglomerados */}
                <Box>
                  <Button
                    color="inherit"
                    sx={buttonStyle}
                    startIcon={<img src="/icons/conglomerado.png" width={24} height={24} />}
                    onClick={(e) => setAnchorElConglomerados(e.currentTarget)}
                  >
                    Conglomerados
                  </Button>

                  <Menu
                    anchorEl={anchorElConglomerados}
                    open={Boolean(anchorElConglomerados)}
                    onClose={handleCloseConglomerados}
                  >
                    <MenuItem onClick={() => { handleCloseConglomerados(); navigate("/conglomerados/crear"); }}>
                      Crear
                    </MenuItem>
                    <MenuItem onClick={() => { handleCloseConglomerados(); navigate("/conglomerados/gestionar"); }}>
                      Gestionar
                    </MenuItem>
                  </Menu>
                </Box>

                {/* Botón Brigadas (Directo) */}
                <Button
                  color="inherit"
                  sx={buttonStyle}
                  startIcon={<img src="/icons/brigada.png" width={24} height={24} style={{ filter: "invert(1)" }} />}
                  onClick={() => navigate("/brigadas/gestionar")}
                >
                  Brigadas
                </Button>

                {/* Botón Herramientas */}
                <Button
                  color="inherit"
                  sx={buttonStyle}
                  startIcon={<img src="/icons/herramientas.png" width={24} height={24} style={{ filter: "invert(1)" }} />}
                  onClick={() => navigate("/herramientas/gestionar")}
                >
                  Herramientas
                </Button>
              </>
            )}

            {/* Botón Manual IFN - Siempre visible */}
            <Button
              color="inherit"
              sx={buttonStyle}
              startIcon={<img src="/icons/manual.png" width={24} height={24} style={{ filter: "invert(1)" }} />}
              onClick={handleManualIFN}
            >
              Manual IFN
            </Button>

            {/* Botón Login/Logout */}
            {usuarioAutenticado ? (
              <Button
                color="inherit"
                sx={buttonStyle}
                startIcon={<img src="/icons/logout.png" width={24} height={24} style={{ filter: "invert(1)" }} />}
                onClick={handleLogout}
              >
                Cerrar Sesión
              </Button>
            ) : (
              <Button
                color="inherit"
                sx={buttonStyle}
                startIcon={<img src="/icons/login.png" width={24} height={24} style={{ filter: "invert(1)" }} />}
                onClick={handleLogin}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}