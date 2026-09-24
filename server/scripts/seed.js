import 'dotenv/config';
import mongoose from 'mongoose';
import Materia from '../src/models/Materia.js';
import Entrega from '../src/models/Entrega.js';
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27019/entrega');
const definiciones = [['Desarrollo web', '#52745b'], ['Bases de datos', '#b8793c'], ['Diseño de interfaces', '#8070ad'], ['Redes', '#4e819a']];
const materias = [];
for (const [nombre, color] of definiciones) materias.push(await Materia.findOneAndUpdate({ clave: nombre.toLowerCase() }, { $setOnInsert: { nombre, color } }, { upsert: true, new: true, runValidators: true }));
const ejemplos = [
 ['Integrar la API del proyecto final', 0, 2, 'alta', 'en_progreso', 120],
 ['Diseñar el modelo de datos', 1, 1, 'alta', 'pendiente', 90],
 ['Prototipo responsive del dashboard', 2, 4, 'media', 'en_progreso', 60],
 ['Documentar los endpoints REST', 0, 6, 'media', 'pendiente', 45],
 ['Práctica de topologías de red', 3, -1, 'alta', 'pendiente', 80],
 ['Repasar componentes y props', 0, -2, 'baja', 'completada', 30]
];
for (const [titulo, materia, dias, prioridad, estado, minutos] of ejemplos) {
 const date = new Date(); date.setDate(date.getDate() + dias);
 const fechaLimite = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 await Entrega.updateOne({ clave: titulo.toLowerCase(), materia: materias[materia]._id }, { $setOnInsert: { titulo, descripcion: 'Entrega de ejemplo para explorar el flujo académico. Puedes editarla o eliminarla.', fechaLimite, prioridad, estado, minutos } }, { upsert: true });
}
console.log('Datos de demostración creados en MongoDB sin reemplazar registros existentes.');
await mongoose.disconnect();
