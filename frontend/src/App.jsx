// src/App.jsx

// 1. IMPORTANTE: Traemos el bloque Home desde su archivo
import Home from './pages/Home'; 

function App() {
  return (
    <div>
      {/* 2. Usamos el componente como si fuera una etiqueta HTML nueva */}
      <Home />
    </div>
  )
}

export default App