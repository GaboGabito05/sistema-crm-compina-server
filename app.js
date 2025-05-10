const express = require('express');
const fs = require('fs').promises; // Leer JSON asíncronamente
const app = express();

// Middlewares
app.use(express.json());

// Cargar datos (con caché en memoria)
let clientesData = [];
async function loadData() {
  try {
    const data = await fs.readFile('./data/clientes.json', 'utf-8');
    clientesData = JSON.parse(data);
    console.log('✅ JSON cargado con', clientesData.length, 'clientes');
  } catch (error) {
    console.error('Error al cargar JSON:', error);
    process.exit(1);
  }
}

// Endpoints
app.get('/clientes', (req, res) => {
  const { pagina = 1, porPagina = 100, etapa, distrito } = req.query;
  
  // Filtrar (si hay parámetros)
  let resultados = [...clientesData];
  if (etapa) resultados = resultados.filter(c => c.etapa === etapa);
  if (distrito) resultados = resultados.filter(c => c.distrito === distrito);

  // Paginación
  const inicio = (pagina - 1) * porPagina;
  const fin = inicio + Number(porPagina);
  const clientesPagina = resultados.slice(inicio, fin);

  res.json({
    total: resultados.length,
    pagina: Number(pagina),
    porPagina: Number(porPagina),
    clientes: clientesPagina
  });
});

// Búsqueda por ID/RUC/Nombre
app.get('/clientes/buscar', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Falta parámetro "q"' });

  const resultados = clientesData.filter(cliente => 
    cliente.id.includes(q) || 
    cliente.ruc.includes(q) || 
    cliente.nombre.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 50); // Limitar resultados

  res.json(resultados);
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await loadData(); // Carga el JSON al iniciar
  console.log(`🚀 API corriendo en http://localhost:${PORT}`);
});