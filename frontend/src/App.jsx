// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // <--- Importante
import Home from './pages/Home';
import Ramas from './pages/Ramas';

function App() {
  return (
    <Router>
      <Layout> {/* El Layout envuelve todo */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ramas" element={<Ramas />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;