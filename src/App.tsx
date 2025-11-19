import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";

import Home from "./pages/Home";
import ConglomeradosCrear from "./pages/CrearConglomerado";
import GestionarConglomerados from './pages/GestionarConglomerado';
import Brigadas from './pages/Brigadas';
import Herramientas from './pages/Herramientas';
import ManualIFN from "./pages/ManualIFN";  
import VisualizarReportes from "./pages/Reportes";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/conglomerados/crear" element={<ConglomeradosCrear />} />
          <Route path="/conglomerados/gestionar" element={<GestionarConglomerados />} />
          {/* Nueva ruta para brigadas */}
          <Route path="/brigadas/gestionar" element={<Brigadas />} />
          <Route path="/herramientas/gestionar" element={<Herramientas />} />
          <Route path="/manualIFN/visualizar" element={<ManualIFN />} />
          <Route path="/reportes" element={<VisualizarReportes />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;

