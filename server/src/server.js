import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
const port = Number(process.env.PORT || 5001);
const uri = process.env.MONGODB_URI;
if (!uri) { console.error('Define MONGODB_URI en server/.env o en Docker Compose.'); process.exit(1); }
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, maxTimeMS: 10000 });
  const server = app.listen(port, '0.0.0.0', () => console.log(`API Entrega disponible en puerto ${port}; MongoDB conectado.`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await mongoose.disconnect(); process.exit(0); }));
} catch (error) { console.error('No se pudo iniciar la API. Comprueba MongoDB:', error.name); process.exit(1); }
