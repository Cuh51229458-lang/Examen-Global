import { useEffect, useState } from 'react';
import { BookOpen, LayoutDashboard, ListTodo, Plus, Search, ArrowUpRight, Check, CalendarDays, RefreshCw, GraduationCap, Leaf } from 'lucide-react';
import { api } from './services/api.js';
import { estados, fechaTexto, payload } from './utils.js';
import Stats from './components/Stats.jsx';
import Modal from './components/Modal.jsx';
import EntregaForm from './components/EntregaForm.jsx';
import EntregaTable from './components/EntregaTable.jsx';
import Materias from './pages/Materias.jsx';
export default function App() {
  const [page, setPage] = useState('resumen');
  const [items, setItems] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('todas');
  const [course, setCourse] = useState('');
  const [form, setForm] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  async function refresh() {
    const [a,b] = await Promise.all([api.entregas(), api.materias()]);
    setItems(a); setMaterias(b); setError('');
  }
  useEffect(() => { let active = true; Promise.all([api.entregas(), api.materias()]).then(([a,b]) => { if (active) { setItems(a); setMaterias(b); } }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  async function retry() { setLoading(true); try { await refresh(); } catch(e) { setError(e.message); } finally { setLoading(false); } }
  async function save(data) {
    const updated = form.item ? await api.actualizar(form.item._id, data) : await api.crear(data);
    setItems(current => [...current.filter(i => i._id !== updated._id), updated].sort((a,b) => a.fechaLimite.localeCompare(b.fechaLimite)));
    setForm(null); setNotice('Entrega guardada en la base de datos.');
  }
  async function complete(item) {
    setBusy(true);
    try { const updated = await api.actualizar(item._id, { ...payload(item), estado: item.estado === 'completada' ? 'pendiente' : 'completada' }); setItems(current => current.map(i => i._id === updated._id ? updated : i)); setNotice('Estado actualizado en MongoDB.'); }
    catch(e) { setError(e.message); } finally { setBusy(false); }
  }
  async function remove() {
    setBusy(true);
    try { await api.eliminar(deleting._id); setItems(current => current.filter(i => i._id !== deleting._id)); setDeleting(null); setNotice('Entrega eliminada.'); }
    catch(e) { setNotice(e.message); setDeleting(null); } finally { setBusy(false); }
  }
  async function view(id) {
    try { setDetail(await api.entrega(id)); } catch(e) { setError(e.message); }
  }
  const done = items.filter(i => i.estado === 'completada').length;
  const progress = items.length ? Math.round(done / items.length * 100) : 0;
  const visible = items.filter(i => (filter === 'todas' || i.estado === filter) && (!course || i.materia._id === course) && `${i.titulo} ${i.materia.nombre}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const next = items.filter(i => i.estado !== 'completada').slice(0, 3);
  const date = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  return <div className="app-shell"><aside className="sidebar"><a className="brand" href="#" onClick={e => { e.preventDefault(); setPage('resumen'); }}><span><Check size={24}/></span>entrega<span className="brand-dot">.</span></a><span className="nav-label">MI ESPACIO</span><nav aria-label="Navegación principal">{[['resumen','Mi resumen',LayoutDashboard],['entregas','Mis entregas',ListTodo],['materias','Materias',BookOpen]].map(([id,label,Icon]) => <button key={id} className={page===id?'active':''} aria-current={page===id?'page':undefined} onClick={() => setPage(id)}><Icon size={18}/>{label}{id==='entregas' && <span className="nav-count">{items.length}</span>}</button>)}</nav><div className="sidebar-note"><Leaf size={24}/><strong>Un paso a la vez.</strong><p>Las grandes metas empiezan con pequeñas entregas.</p></div><div className="profile"><span><GraduationCap size={20}/></span><div><strong>Mi agenda personal</strong><small>Espacio de estudiante</small></div></div></aside>
    <div className="workspace"><header className="topbar"><span>Mi espacio <span className="slash">/</span> <strong>{page==='resumen'?'Resumen':page==='materias'?'Materias':'Entregas'}</strong></span><span className="today"><CalendarDays size={15}/>{date}</span></header><main>
      {page !== 'materias' && <section className="section-heading"><div><span className="eyebrow">TU SEMESTRE, EN ORDEN</span><h1>{page==='resumen'?'Dale espacio a tus metas.':'Mis entregas'}</h1><p>{page==='resumen'?'Menos pendientes en tu cabeza. Más claridad para avanzar.':'Cada trabajo, su fecha y tu siguiente paso.'}</p></div><button className="primary" onClick={() => setForm({item:null})} disabled={loading || !materias.length}><Plus size={17}/>Nueva entrega</button></section>}
      {error && <div className="error-banner" role="alert"><span>{error}</span><button className="secondary" onClick={retry}><RefreshCw size={14}/>Reintentar</button></div>}
      {loading ? <div className="loading" role="status">Cargando tu agenda desde el servidor…</div> : page==='materias' ? <Materias materias={materias} items={items} refresh={refresh} notify={setNotice}/> : <>
      {page==='resumen' && <><section className="hero"><div><span className="eyebrow">CADA AVANCE CUENTA</span><h2>Hoy es un buen día<br/>para dar el siguiente paso.</h2><p>{items.length-done} entregas por resolver. Tú marcas el ritmo.</p><button onClick={() => { setPage('entregas'); setFilter('pendiente'); }}>Ver mis pendientes <ArrowUpRight size={16}/></button></div><div className="hero-art" aria-hidden="true"><div className="paper back"/><div className="paper front"><span className="paper-label">MI PLAN</span><div><i className="checkmark">✓</i><span/></div><div><i className="checkmark">✓</i><span/></div><div><i/><span/></div><div><i/><span/></div></div><span className="spark">✦</span><span className="art-circle"/></div></section><Stats items={items}/></>}
      <div className={page==='resumen'?'content-grid':''}><section className="panel task-panel"><div className="panel-heading"><div><h2>{page==='resumen'?'Tu lista de entregas':'Todas tus entregas'}</h2><p>Haz espacio para lo que sigue.</p></div><span className="counter">{items.length} en total</span></div><div className="toolbar"><label className="search"><Search size={16}/><span className="sr-only">Buscar entregas</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar una entrega…"/></label><label><span className="sr-only">Filtrar por materia</span><select value={course} onChange={e => setCourse(e.target.value)}><option value="">Todas las materias</option>{materias.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}</select></label></div><div className="tabs" role="group" aria-label="Filtrar por estado">{[['todas','Todas'],...Object.entries(estados)].map(([id,label]) => <button key={id} aria-pressed={filter===id} onClick={() => setFilter(id)}>{label}</button>)}</div><EntregaTable items={visible} onView={view} onEdit={item => setForm({item})} onDelete={setDeleting} onComplete={complete} busy={busy}/><div className="table-footer">Mostrando {visible.length} de {items.length} entregas <span>Tu siguiente logro empieza aquí.</span></div></section>
      {page==='resumen' && <aside className="right-column"><section className="panel progress-panel"><span className="eyebrow">ASÍ VAS</span><h2>Tu progreso</h2><div className="progress-ring" style={{'--progress':`${progress}%`}}><div><strong>{progress}%</strong><span>completado</span></div></div><p><strong>{done}</strong> de {items.length} entregas listas</p><span className="encouragement">Cada pequeño paso suma.</span></section><section className="panel upcoming"><h2>En el horizonte</h2>{next.length ? next.map(i => <button key={i._id} onClick={() => view(i._id)}><span className="date-chip">{fechaTexto(i.fechaLimite)}</span><span><strong>{i.titulo}</strong><small>{i.materia.nombre}</small></span></button>) : <p>No hay entregas pendientes.</p>}</section></aside>}
      </div></>}
      <footer><span>Hecho para avanzar, a tu ritmo.</span><span>Entrega · Agenda académica</span></footer>
    </main></div>
    {notice && <div className="toast" role="status"><Check size={17}/><span>{notice}</span><button aria-label="Cerrar aviso" onClick={() => setNotice('')}>×</button></div>}
    {form && <EntregaForm item={form.item} materias={materias} onSave={save} onClose={() => setForm(null)}/>}
    {deleting && <Modal title="¿Eliminar esta entrega?" onClose={() => setDeleting(null)} busy={busy}><p className="confirm-text">Se eliminará <strong>{deleting.titulo}</strong> de la base de datos. Esta acción no se puede deshacer.</p><div className="modal-actions"><button className="secondary" disabled={busy} onClick={() => setDeleting(null)}>Cancelar</button><button className="danger-button" disabled={busy} onClick={remove}>{busy?'Eliminando…':'Confirmar eliminación'}</button></div></Modal>}
    {detail && <Modal title={detail.titulo} onClose={() => setDetail(null)}><dl className="detail"><div><dt>Materia</dt><dd>{detail.materia.nombre}</dd></div><div><dt>Estado</dt><dd>{estados[detail.estado]}</dd></div><div><dt>Fecha límite</dt><dd>{detail.fechaLimite}</dd></div><div><dt>Prioridad</dt><dd>{detail.prioridad}</dd></div><div><dt>Tiempo estimado</dt><dd>{detail.minutos} minutos</dd></div></dl><p className="description">{detail.descripcion || 'Sin descripción adicional.'}</p><button className="primary" onClick={() => { setForm({item:detail}); setDetail(null); }}>Editar entrega</button></Modal>}
  </div>;
}
