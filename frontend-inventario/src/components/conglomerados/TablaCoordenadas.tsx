import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import { Coordenada } from '../../models/Conglomerado';

interface TablaCoordenadasProps {
  coordenadas: Coordenada[];
}

const TablaCoordenadas: React.FC<TablaCoordenadasProps> = ({ coordenadas }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#E8F5E8' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Latitud</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Longitud</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Región</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {coordenadas.map((coordenada) => (
            <TableRow key={coordenada.id}>
              <TableCell>{coordenada.id}</TableCell>
              <TableCell>{coordenada.latitud}</TableCell>
              <TableCell>{coordenada.longitud}</TableCell>
              <TableCell>{coordenada.region}</TableCell>
              <TableCell>
                <Chip 
                  label={coordenada.estaEnBosque ? "En bosque" : "Fuera de bosque"}
                  color={coordenada.estaEnBosque ? "success" : "error"}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TablaCoordenadas;