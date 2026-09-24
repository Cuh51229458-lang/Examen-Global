import { ClipboardList, Clock3, CircleCheck, TriangleAlert } from 'lucide-react';
import { vencida } from '../utils.js';
export default function Stats({ items }) {
  const stats = [ ['Entregas totales', items.length, ClipboardList, 'Todo tu semestre'], ['En progreso', items.filter(i => i.estado === 'en_progreso').length, Clock3, 'Paso a paso'], ['Completadas', items.filter(i => i.estado === 'completada').length, CircleCheck, 'Un logro más'], ['Atrasadas', items.filter(vencida).length, TriangleAlert, 'Necesitan tu atención'] ];
  return <div className="stats">{stats.map(([label, value, Icon, hint]) => <article key={label}><div><span>{label}</span><Icon size={17}/></div><strong>{value}</strong><small>{hint}</small></article>)}</div>;
}
