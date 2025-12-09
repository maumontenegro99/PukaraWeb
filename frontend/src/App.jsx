// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // <--- Importante
import Home from './pages/Home';
import Ramas from './pages/Ramas';
import Miembros from './pages/Miembros';

function App() {
  return (
    <Router>
      <Layout> {/* El Layout envuelve todo */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ramas" element={<Ramas />} />
          <Route path="/miembros" element={<Miembros />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;