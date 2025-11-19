import React from "react";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Menu,
  MenuItem
} from "@mui/material";

export default function Home() {

  // 📸 Imágenes del carrusel / galería
  const imagenes = [
    "/images/carrusel7.jpg",
    "/images/carrusel5.jpg",
    "/images/carrusel3.jpg",
    "/images/carrusel4.jpg",
  ];

  return (
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          backgroundImage: "url('/images/fondo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 10,
          pb: 10,
        }}
      >

        {/* -------------------- Título y Bienvenida -------------------- */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            width: "100%",
            mb: 6,
            padding: "0 40px",
          }}
        >
          {/* Título */}
          <Box sx={{ flex: 1, marginLeft: 6, minWidth: "300px" }}>
            <Typography variant="h2" sx={{ color: "white", fontWeight: "bold", textShadow: "3px 3px 6px rgba(0,0,0,0.8)", lineHeight: 0.9, mb: 0.5 }}>
              INVENTARIO
            </Typography>

            <Typography variant="h3" sx={{ color: "white", textShadow: "3px 3px 6px rgba(0,0,0,0.8)", lineHeight: 0.9 }}>
              FORESTAL
            </Typography>

            <Typography variant="h4" sx={{ color: "white", textShadow: "3px 3px 6px rgba(0,0,0,0.8)", lineHeight: 0.9 }}>
              NACIONAL
            </Typography>
          </Box>

          {/* Bienvenida */}
          <Box sx={{ flex: 1, maxWidth: "400px", textAlign: "left", mt: 1 }}>
            <Typography variant="h2" sx={{ color: "white", fontWeight: "bold", textShadow: "2px 2px 4px rgba(0,0,0,0.7)", mb: 1.5 }}>
              ¡Bienvenido!
            </Typography>
            <Typography variant="body1" sx={{ color: "white", textShadow: "2px 2px 4px rgba(0,0,0,0.7)", fontSize: "1.1rem" }}>
              Aquí podrás gestionar brigadas, conglomerados y reportes del Inventario Forestal.
            </Typography>
          </Box>
        </Box>

        {/* -------------------- Galería -------------------- */}
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 3,
              mt: 3,
            }}
          >
            {imagenes.map((img, index) => (
              <Box
                key={index}
                component="img"
                src={img}
                sx={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
                }}
              />
            ))}
          </Box>
        </Container>

        {/* -------------------- Sección adicional 1 -------------------- */}
        <Container maxWidth="lg" sx={{ mt: 6 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              padding: 4,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src="/icons/Mapa.png"
                sx={{ width: 40, height: 40, filter: "brightness(0) invert(1)" }}
              />
            </Box>

            <Box>
              <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 2 }}>
                Información del IFN
              </Typography>
              <Typography sx={{ color: "white" }}>
                El Inventario Forestal Nacional (IFN) es una herramienta esencial que ofrece información precisa
                sobre el estado, extensión y distribución de los bosques en Colombia. Permite conocer las 
                características ecológicas del país y facilita la toma de decisiones basadas en datos confiables.
              </Typography>
            </Box>
          </Box>
        </Container>

        {/* -------------------- Sección adicional 2 -------------------- */}
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              padding: 4,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                component="img"
                src="/icons/Arbol.png"
                sx={{ width: 40, height: 40, filter: "brightness(0) invert(1)" }}
              />
            </Box>

            <Box>
              <Typography variant="h4" sx={{ color: "white", fontWeight: "bold", mb: 2 }}>
                Valor del IFN
              </Typography>
              <Typography sx={{ color: "white" }}>
                Su principal valor radica en aportar información técnica y científica para la gestión sostenible de
                los recursos forestales. Contribuye a conservar la biodiversidad y a cumplir los compromisos  
                ambientales tanto nacionales como internacionales.
              </Typography>
            </Box>
          </Box>
        </Container>

      </Box>
  );
}
