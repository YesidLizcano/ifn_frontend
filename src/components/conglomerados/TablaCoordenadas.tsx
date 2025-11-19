import React, { useState } from 'react'; // <-- agregar useState
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button // <-- agregar Button
} from '@mui/material';
import { Coordenada } from '../../models/Conglomerado';

interface TablaCoordenadasProps {
  coordenadas: Coordenada[];
  onEliminar: (id: number) => void;
  onAsignar: (id: number) => void;
}

const TablaCoordenadas: React.FC<TablaCoordenadasProps> = ({ coordenadas, onEliminar, onAsignar }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper style={{ marginTop: '20px' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Latitud</TableCell>
              <TableCell>Longitud</TableCell>
              <TableCell>Municipio</TableCell>
              <TableCell>Departamento</TableCell>
              <TableCell>Gestionar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coordenadas
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.latitud}</TableCell>
                  <TableCell>{c.longitud}</TableCell>
                  <TableCell>{c.municipio}</TableCell>
                  <TableCell>{c.departamento}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      style={{ marginRight: 8 }}
                      onClick={() => onAsignar(c.id)}
                    >
                      Asignar
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => onEliminar(c.id)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={coordenadas.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20]}
      />
    </Paper>
  );
};

export default TablaCoordenadas;
