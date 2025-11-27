import React, { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

const CONSENT_KEY = 'cookie_consent';

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const valor = localStorage.getItem(CONSENT_KEY);
      if (!valor) setVisible(true);
    } catch (e) {
      // Si localStorage no está disponible, mostrar igualmente
      setVisible(true);
    }
  }, []);

  const aceptar = () => {
    try { localStorage.setItem(CONSENT_KEY, 'accepted'); } catch (e) {}
    setVisible(false);
    window.dispatchEvent(new Event('cookieConsentChanged'));
  };

  const rechazar = () => {
    try { localStorage.setItem(CONSENT_KEY, 'declined'); } catch (e) {}
    setVisible(false);
    window.dispatchEvent(new Event('cookieConsentChanged'));
  };

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 1400,
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Uso de cookies</Typography>
        <Typography variant="body2" sx={{ color: '#555' }}>
          Este sitio usa cookies para gestionar la sesión y mejorar la experiencia. ¿Aceptas el uso de cookies?
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="outlined" color="inherit" onClick={rechazar}>Rechazar</Button>
        <Button variant="contained" color="primary" onClick={aceptar}>Aceptar</Button>
      </Box>
    </Box>
  );
};

export default CookieConsent;
