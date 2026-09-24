import { Check, Pencil, Trash2, ArrowUpRight, Inbox } from 'lucide-react';
import { estados, fechaTexto, vencida } from '../utils.js';
export default function EntregaTable({ items, onView, onEdit, onDelete, onComplete, busy }) {
  if (!items.length) return <div className="empty"><Inbox size={34}/><h3>Un espacio para tu próximo logro</h3><p>No hay entregas que coincidan. Crea una nueva o cambia los filtros.</p></div>;
  return <div className="table-scroll"><table><caption className="sr-only">Entregas académicas, fechas, prioridades y acciones</caption><thead><tr><th>ENTREGA</th><th>FECHA LÍMITE</th><th>PRIORIDAD</th><th>ESTADO</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{items.map(item => <tr key={item._id} className={item.estado === 'completada' ? 'finished' : ''}>
    <td><button className="task-title" onClick={() => onView(item._id)}>{item.titulo}<ArrowUpRight size={13}/></button><span className="course-label"><i style={{ background: item.materia.color }}/>{item.materia.nombre}</span></td>
    <td><span className={vencida(item) ? 'overdue' : ''}>{fechaTexto(item.fechaLimite)}</span>{vencida(item) && <small className="overdue">Atrasada</small>}</td>
    <td><span className={`priority ${item.prioridad}`}><i/>{item.prioridad}</span></td><td><span className={`badge ${item.estado}`}>{estados[item.estado]}</span></td>
    <td><div className="row-actions"><button disabled={busy} className="icon-button" title={item.estado === 'completada' ? 'Reabrir' : 'Completar'} aria-label={`${item.estado === 'completada' ? 'Reabrir' : 'Completar'} ${item.titulo}`} onClick={() => onComplete(item)}><Check size={16}/></button><button disabled={busy} className="icon-button" aria-label={`Editar ${item.titulo}`} onClick={() => onEdit(item)}><Pencil size={15}/></button><button disabled={busy} className="icon-button danger" aria-label={`Eliminar ${item.titulo}`} onClick={() => onDelete(item)}><Trash2 size={15}/></button></div></td>
  </tr>)}</tbody></table></div>;
}
