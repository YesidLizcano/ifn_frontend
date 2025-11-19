import React from "react";
import { Box, Container, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box component="footer" sx={{ backgroundColor: "#011401ff", color: "white", py: 3 }}>
        <Container maxWidth="lg">

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 3, mb: 2 }}>
            
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <img src="/icons/Logo.png" style={{ width: 100, height: 100, marginRight: 15 }} />
              <Typography sx={{ fontWeight: "bold", whiteSpace: "pre-line" }}>
                {"INVENTARIO FORESTAL\nNACIONAL"}
              </Typography>
            </Box>

            {/* CREADORES */}
            <Box>
              <Typography sx={{ fontWeight: "bold", mb: 1 }}>CREADORES</Typography>
              <Typography>Luis David Hernández López</Typography>
              <Typography>Brayan Yesid Lizcano Bautista</Typography>
              <Typography>Jubal Gustavo Rojas Vega</Typography>
            </Box>

            {/* CONTACTO */}
            <Box>
              <Typography sx={{ fontWeight: "bold", mb: 1 }}>CONTÁCTENOS:</Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <img src="/icons/facebook.png" width={40} height={40} style={{ filter: "invert(1)" }} />
                <img src="/icons/instagram.png" width={40} height={40} style={{ filter: "invert(1)" }} />
                <img src="/icons/sitio-web.png" width={40} height={40} style={{ filter: "invert(1)" }} />
              </Box>
            </Box>
          </Box>

          <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.2)", pt: 2, textAlign: "center" }}>
            <Typography sx={{ opacity: 0.7 }}>
              ©2025 INVENTARIO FORESTAL NACIONAL - TODOS LOS DERECHOS RESERVADOS.
            </Typography>
          </Box>

        </Container>
      </Box>
  );
}
