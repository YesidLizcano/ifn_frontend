// 1. Crea un componente ManualIFN.tsx
import React from 'react';
import { Box, Container, Typography, Card, Button } from '@mui/material';

const ManualIFN: React.FC = () => {
  return (
    <Box 
      sx={{ 
        flex: 1,
        backgroundImage: 'url("/images/fondo.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        py: 3,
        minHeight: '100vh'
      }}
    >
      <Container maxWidth="lg">
        <Card sx={{ p: 4, backgroundColor: 'rgba(255,255,255,0.95)', textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
            Manual IFN Colombia
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Manual del Inventario Forestal Nacional de Colombia - Versión 4
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <iframe 
              src="https://visionamazonia.minambiente.gov.co/content/uploads/2023/04/Manual_IFN_Colombia_v4.pdf"
              width="100%"
              height="600px"
              style={{ border: 'none', borderRadius: '8px' }}
              title="Manual IFN Colombia"
            />
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.open('https://visionamazonia.minambiente.gov.co/content/uploads/2023/04/Manual_IFN_Colombia_v4.pdf', '_blank')}
            sx={{ mr: 2 }}
          >
            Abrir en nueva pestaña
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            component="a"
            href="https://visionamazonia.minambiente.gov.co/content/uploads/2023/04/Manual_IFN_Colombia_v4.pdf"
            download="Manual_IFN_Colombia_v4.pdf"
          >
            Descargar PDF
          </Button>
        </Card>
      </Container>
    </Box>
  );
};

export default ManualIFN;