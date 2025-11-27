import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppBar, Toolbar, Button, Box, Menu, MenuItem, Typography, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';
import { getCookie, removeCookie } from "../utils/cookies";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Verificar si hay un usuario autenticado al cargar el componente y escuchar cambios
  useEffect(() => {
    const checkAuth = () => {
      const usuario = getCookie('usuarioAutenticado');
      setUsuarioAutenticado(usuario === 'true');
    };

    // Verificar al cargar
    checkAuth();

    // Escuchar cambios en eventos personalizados
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('authStateChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authStateChange', handleAuthChange);
    };
  }, []);

  const handleCloseConglomerados = () => setAnchorElConglomerados(null);

  const handleLogin = () => {
    navigate("/login");
    setMobileOpen(false);
  };

  const handleLogout = () => {
    removeCookie('access_token');
    removeCookie('usuarioAutenticado');
    removeCookie('usuarioEmail');
    removeCookie('usuarioNombre');
    setUsuarioAutenticado(false);
    // Disparar evento para notificar el logout
    window.dispatchEvent(new Event('authStateChange'));
    navigate('/');
    setMobileOpen(false);
  };

  const handleManualIFN = () => {
    navigate("/manualIFN/visualizar");
    setMobileOpen(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        IFN
      </Typography>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/")}>
            <ListItemText primary="Inicio" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate("/reportes")}>
            <ListItemText primary="Reportes" />
          </ListItemButton>
        </ListItem>
        {usuarioAutenticado && (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/conglomerados/crear")}>
                <ListItemText primary="Crear Conglomerado" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/conglomerados/gestionar")}>
                <ListItemText primary="Gestionar Conglomerados" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/brigadas/gestionar")}>
                <ListItemText primary="Brigadas" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/herramientas/gestionar")}>
                <ListItemText primary="Herramientas" />
              </ListItemButton>
            </ListItem>
          </>
        )}
        <ListItem disablePadding>
          <ListItemButton onClick={handleManualIFN}>
            <ListItemText primary="Manual IFN" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={usuarioAutenticado ? handleLogout : handleLogin}>
            <ListItemText primary={usuarioAutenticado ? "Cerrar Sesión" : "Login"} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

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
                fontSize: { xs: "0.9rem", sm: "1.1rem" },
              }}
            >
              {"INVENTARIO FORESTAL\nNACIONAL"}
            </Typography>
          </Box>

          {/* Botones Desktop */}
          {!isMobile ? (
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
                startIcon={<img src="/icons/Inicio.png" width={24} height={24} style={{ filter: "invert(1)" }} />}
                onClick={() => navigate("/")}
              >
                Inicio
              </Button>

              {/* Botón Reportes - Siempre visible */}
              <Button
                color="inherit"
                sx={buttonStyle}
                startIcon={<img src="/icons/Reportes.png" width={24} height={24} style={{ filter: "invert(1)" }} />}
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
                startIcon={<img src="/icons/Manual.png" width={24} height={24} style={{ filter: "invert(1)" }} />}
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
                  startIcon={<img src="/icons/Login.png" width={24} height={24} style={{ filter: "invert(1)" }} />}
                  onClick={handleLogin}
                >
                  Login
                </Button>
              )}
            </Box>
          ) : (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </ThemeProvider>
  );
}