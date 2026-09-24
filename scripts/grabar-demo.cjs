const { chromium } = require('playwright');
const fs=require('node:fs');
const root=require('node:path').resolve(__dirname,'..');
const out=root+'/output/video';fs.mkdirSync(out,{recursive:true});
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
(async()=>{
const b=await chromium.launch({channel:'chrome',headless:true});
const context=await b.newContext({viewport:{width:1440,height:900},recordVideo:{dir:out,size:{width:1440,height:900}}});
const p=await context.newPage();
async function card(title,text,code='') { await p.setContent(`<html lang="es"><body style="margin:0;background:#f5f7f0;color:#294631;font:22px Arial;padding:65px"><small style="letter-spacing:4px;color:#819569">ENTREGA · EXAMEN GLOBAL</small><h1 style="font-size:50px;margin:45px 0 25px">${esc(title)}</h1><p style="max-width:1100px;line-height:1.8">${esc(text)}</p>${code?`<pre style="background:#e7ecdf;padding:28px;border-radius:15px;font:18px monospace;white-space:pre-wrap;line-height:1.5">${esc(code)}</pre>`:''}</body></html>`); await p.waitForTimeout(6000); }
async function caption(text) {await p.evaluate(text=>{document.querySelector('#demo-caption')?.remove();const d=document.createElement('div');d.id='demo-caption';d.textContent=text;Object.assign(d.style,{position:'fixed',bottom:'15px',left:'220px',right:'25px',padding:'18px',background:'#213f30',color:'white',borderRadius:'10px',font:'17px Arial',zIndex:10000});document.body.append(d)},text);await p.waitForTimeout(2500);}
await card('Tu semestre, en orden.','Problema: los trabajos dispersos hacen difícil recordar fechas y prioridades. Entrega organiza la agenda personal de un estudiante, con datos persistentes.');
await card('Arquitectura Full Stack','La interfaz consulta una API REST. Express valida las solicitudes y Mongoose guarda los registros en MongoDB.','Usuario → React / Vite → HTTP /api → Express → MongoDB\n\nEntidades: Materia (1) → Entrega (muchas)\n\nAlcance: agenda local personal, sin autenticación.');
await p.goto('http://127.0.0.1:5176');await p.getByRole('button',{name:'Nueva entrega',exact:true}).waitFor();
await caption('El panel muestra registros consultados desde MongoDB a través de GET /api/entregas.');
await p.getByRole('button',{name:'Materias',exact:true}).click();await caption('Cada entrega pertenece a una materia; el catálogo también proviene de la API.');
await p.getByRole('button',{name:'Mi resumen',exact:true}).click();
await p.getByRole('button',{name:'Nueva entrega',exact:true}).click();
await p.getByLabel('Título de la entrega').fill('Demostración: entregar examen global');
await p.getByLabel('Fecha límite').fill('2026-10-25');
await p.getByLabel('Descripción').fill('Preparar documentación y defender la arquitectura Full Stack.');
await p.waitForTimeout(3500);await p.getByRole('button',{name:'Guardar entrega',exact:true}).click();
await p.getByRole('button',{name:'Demostración: entregar examen global',exact:true}).waitFor();
await caption('CREATE: POST valida y guarda una entrega real en MongoDB.');
await p.reload();await p.getByRole('button',{name:'Demostración: entregar examen global',exact:true}).click();await p.waitForTimeout(4000);
await p.getByRole('button',{name:'Editar entrega',exact:true}).click();
await p.locator('select[name=estado]').selectOption('en_progreso');await p.getByLabel('Tiempo estimado').fill('90');await p.waitForTimeout(3000);
await p.getByRole('button',{name:'Guardar entrega',exact:true}).click();await caption('UPDATE: PUT actualiza estado y tiempo estimado. La recarga previa confirmó persistencia.');
await p.getByRole('button',{name:'Completar Demostración: entregar examen global',exact:true}).click();await p.getByRole('button',{name:'Completada',exact:true}).click();await caption('Los filtros y los indicadores reaccionan a los datos actualizados.');
await p.getByRole('button',{name:'Eliminar Demostración: entregar examen global',exact:true}).click();await p.waitForTimeout(3500);await p.getByRole('button',{name:'Confirmar eliminación',exact:true}).click();await caption('DELETE: se pide confirmación antes de eliminar el registro de la base.');
const evidence=JSON.parse(fs.readFileSync(root+'/docs/evidencia-api.json','utf8'));
await card('API REST: evidencia real','Los siguientes códigos provienen de solicitudes ejecutadas contra el backend local.',evidence.log.map(x=>`${x.method} ${x.path} → HTTP ${x.status}`).join('\n'));
await card('Persistencia comprobada','Ocho pruebas de integración aprobadas. Una prueba detuvo MongoDB, reabrió los mismos archivos WiredTiger y comprobó que el registro conservó sus cambios.','npm test\n\n8 pruebas aprobadas · 0 fallos\nCRUD · duplicados · validación · errores · persistencia');
await card('Docker: configuración lista, ejecución pendiente','Esta Mac no tiene Docker instalado. No se presentan pruebas locales como evidencia de contenedores. Ejecutar estos comandos en un equipo con Docker y completar la sección del video.','docker compose up --build -d --wait\ndocker compose ps\nbash scripts/verificar-docker.sh\n\nServicios: frontend (Nginx), backend (Express), db (MongoDB).\nPersistencia: volumen mongo_data.');
await card('Código y entrega','El proyecto contiene componentes reutilizables, validaciones backend y pruebas. La publicación en GitHub está pendiente de autorización; el historial local conserva commits progresivos.','client/src/components/ → formulario, tabla, modal, indicadores\nclient/src/services/api.js → solicitudes HTTP\nserver/src/controllers/ → lógica CRUD\nserver/src/models/ → modelos MongoDB\ndocker-compose.yml → red, servicios y volumen\n\nConsulta docs/guion-video.md para preparar la defensa oral.');
const video=p.video();await context.close();await video.saveAs(out+'/demostracion-local.webm');await b.close();
for(const f of fs.readdirSync(out))if(f.endsWith('.webm')&&f!=='demostracion-local.webm')fs.unlinkSync(out+'/'+f);
console.log(out+'/demostracion-local.webm');
})().catch(e=>{console.error(e);process.exit(1)});
