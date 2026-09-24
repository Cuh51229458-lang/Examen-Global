from pathlib import Path
import json
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from xml.sax.saxutils import escape
r=Path(__file__).resolve().parents[1]
out=r/'output/pdf';out.mkdir(parents=True,exist_ok=True)
c=canvas.Canvas(str(out/'evidencias-entrega.pdf'),pagesize=(595.28,841.89))
c.setTitle('Entrega - Examen Global - Evidencias de implementación')
W,H=595.28,841.89;green=HexColor('#294d38');muted=HexColor('#697b64');ink=HexColor('#293c30');n=0
style=ParagraphStyle('body',fontName='Helvetica',fontSize=10.5,leading=16,textColor=ink,spaceAfter=10)
def para(txt,y,width=491,x=52,size=10.5):
 st=ParagraphStyle('p',parent=style,fontSize=size,leading=size*1.5)
 p=Paragraph(txt,st);ww,hh=p.wrap(width,700);p.drawOn(c,x,y-hh);return y-hh-12
def title(kicker,heading):
 global n
 n+=1;c.setFillColor(HexColor('#f8faf5'));c.rect(0,0,W,H,fill=1,stroke=0)
 c.setFillColor(green);c.setFont('Helvetica-Bold',10);c.drawString(52,H-46,'ENTREGA / EXAMEN GLOBAL')
 c.setFont('Helvetica',8);c.setFillColor(muted);c.drawRightString(W-52,33,f'{n:02d} / EVIDENCIAS')
 c.setStrokeColor(HexColor('#dce5d4'));c.line(52,52,W-52,52)
 c.setFont('Helvetica-Bold',8);c.setFillColor(muted);c.drawString(52,H-87,kicker.upper())
 c.setFont('Helvetica-Bold',25);c.setFillColor(green);c.drawString(52,H-121,heading)
 return H-151
def section(text,y):
 c.setFillColor(green);c.setFont('Helvetica-Bold',13);c.drawString(52,y,text);return y-20
def code(text,y,width=491):
 lines=text.splitlines();height=18*len(lines)+24
 c.setFillColor(HexColor('#eaf0e3'));c.roundRect(52,y-height,width,height,8,fill=1,stroke=0)
 c.setFillColor(ink);c.setFont('Courier',8)
 for i,line in enumerate(lines):c.drawString(64,y-20-i*18,line)
 return y-height-18
def picture(name,y,maxh=530,width=491,x=52):
 img=ImageReader(str(r/'docs/capturas'/name));iw,ih=img.getSize();scale=min(width/iw,maxh/ih);w,h=iw*scale,ih*scale
 c.drawImage(img,x+(width-w)/2,y-h,width=w,height=h,mask='auto');return y-h-15

y=title('Proyecto full stack','Tu semestre, en orden.')
y=para('Aplicación web para organizar entregas académicas con React, Express y MongoDB.',y,size=18)
y-=25
y=section('Documento de evidencias',y)
y=para('<b>Proyecto:</b> Entrega<br/><b>Actividad:</b> Examen Global<br/><b>Estudiante:</b> nombre pendiente de proporcionar<br/><b>Asignatura:</b> nombre pendiente de proporcionar<br/><b>Fecha de elaboración:</b> 23 de septiembre de 2026',y)
y-=20
y=para('<b>Estado:</b> implementación local funcional y probada. PDF y grabación preparados. La ejecución de Docker no pudo comprobarse porque el equipo no tiene Docker instalado. La publicación del nuevo proyecto en GitHub requiere autorización del usuario.',y)
y=para('Este documento separa las pruebas ejecutadas de los pasos pendientes. Las capturas y respuestas presentadas provienen de la aplicación y base de datos reales.',y)
c.showPage()
y=title('01 / Definición','Un problema concreto')
for heading,txt in [('Problema y contexto','Los estudiantes administran trabajos entre chats, libretas y plataformas. Esto dificulta conocer qué falta, cuál es la fecha límite y qué conviene priorizar.'),('Objetivo y usuarios','Ofrecer a un estudiante una agenda personal para registrar entregas, consultar fechas y visualizar el avance del semestre desde computadora o teléfono.'),('Información y funcionalidades','Materias y entregas; título, descripción, fecha, prioridad, estado y tiempo estimado. CRUD completo, búsqueda, filtros, confirmación de borrado, estados de carga, vacío y error.'),('Alcance','Uso personal local. Sin cuentas, calificaciones, adjuntos o notificaciones. Los datos principales proceden de la API y se almacenan en MongoDB. No se debe exponer como servicio multiusuario sin autenticación y autorización.'),('Requisitos principales','React y Vite en frontend; Node y Express en backend; API REST; base de datos real; validaciones; Dockerfiles y Compose; volumen persistente; Git progresivo; documentación, capturas y video.')]:
 y=section(heading,y);y=para(txt,y)
c.showPage()
y=title('02 / Arquitectura','Cada capa tiene su función')
y=code('Usuario / navegador\n      | HTTP\nReact + Vite / Nginx\n      | /api/entregas\nExpress + validaciones + controladores\n      | Mongoose\nMongoDB / WiredTiger',y)
y=para('En desarrollo, Vite dirige /api a Express. En Docker, Nginx sirve la compilación y realiza el proxy a backend:5001; el backend se conecta a db:27017. Compose usa DNS interno y espera healthchecks sanos.',y)
y=section('Modelo básico de datos',y)
y=para('<b>Materia:</b> ObjectId, nombre de hasta 60 caracteres, clave normalizada única y color hexadecimal. <b>Entrega:</b> ObjectId, título, descripción, materia referenciada, fecha ISO de calendario, prioridad, estado y minutos enteros. Ambos modelos incluyen marcas de creación y actualización.',y)
y=para('<b>Relación 1:N:</b> una materia tiene muchas entregas. El índice único materia + clave evita títulos duplicados en una asignatura. Una referencia a materia inexistente se rechaza. Los tiempos deben estar entre 5 y 2400 minutos.',y)
y=section('Responsabilidades',y)
y=para('Componentes de React: formulario, tabla, modal e indicadores. services/api.js centraliza HTTP. Los controladores procesan CRUD, validation.js aplica reglas y los modelos definen la persistencia. Ningún componente concentra toda la aplicación.',y)
c.showPage()
y=title('03 / Frontend','Vista principal conectada')
y=para('Panel con seis registros de demostración cargados en MongoDB. Los indicadores, prioridades, estados y próximas entregas se calculan desde la respuesta de la API.',y)
y=picture('01-panel.png',y,maxh=535)
para('Captura real del navegador. Los datos de demostración se crean con un script opcional; la aplicación también funciona con una base inicialmente vacía.',y,size=9)
c.showPage()
y=title('04 / Operaciones','Crear, consultar y modificar')
y=para('El formulario envía POST o PUT. React ofrece controles y límites; Express vuelve a validar tipos, rangos, referencias, fechas y duplicados antes de guardar. La vista detalle consulta GET /api/entregas/:id.',y)
y=picture('08-formulario-detalle.png',y,maxh=490)
y=para('Prueba ejecutada: crear una entrega desde React, recargar para comprobar persistencia, abrir su detalle, cambiar estado y tiempo, completar y filtrar. Después se canceló un borrado y se confirmó otro.',y,size=10)
c.showPage()
y=title('05 / Diseño adaptable','Agenda en pantalla móvil')
y=para('Captura a 390 px. La tabla tiene desplazamiento interno para conservar sus columnas. La página completa no presenta desbordamiento horizontal.',y)
y=picture('09-movil-viewport.png',y,maxh=535,width=491)
para('También se comprobó el estado de error de conexión y la recuperación con Reintentar. Los diálogos nativos admiten teclado y Escape; las animaciones respetan movimiento reducido.',y,size=9)
c.showPage()
y=title('06 / Backend y API','Respuestas HTTP verificadas')
data=json.loads((r/'docs/evidencia-api.json').read_text())
y=para('Evidencia registrada contra Express conectado a MongoDB. El script crea un registro temporal, lo consulta, actualiza y elimina. El último GET confirma que ya no existe.',y)
for entry in data['log']:
 path=entry['path'];path=path.replace(path.split('/')[-1],':id') if path.startswith('/entregas/') else path
 y=code(f"{entry['method']} /api{path}  ->  HTTP {entry['status']}",y)
y=para('Archivo completo: docs/evidencia-api.json. Incluye identificadores reales y cuerpos de respuesta. GET /api/health confirmó database: connected.',y,size=9)
c.showPage()
y=title('07 / Persistencia y calidad','MongoDB real, no un arreglo')
db=json.loads((r/'docs/evidencia-db.json').read_text());sample=db['entregas'][0]
y=para(f'Consulta directa a la base <b>{db["base"]}</b>: {db["total"]} entregas persistidas. El archivo docs/evidencia-db.json incluye colecciones y documentos consultados mediante el driver de MongoDB.',y)
y=code(json.dumps({k:sample[k] for k in ['_id','titulo','materia','fechaLimite','estado','minutos']},ensure_ascii=False,indent=2),y)
y=section('Ocho pruebas de integración aprobadas',y)
y=para('1. Salud y conexión real.<br/>2. Materias y duplicados.<br/>3. Creación, listado y consulta individual.<br/>4. Tipos, fechas, rangos, referencias y errores.<br/>5. Actualización almacenada.<br/>6. Persistencia tras detener y reabrir mongod.<br/>7. Eliminación y respuesta 404 posterior.<br/>8. JSON incorrecto y rutas inexistentes.',y)
y=para('<b>Resultado:</b> 8 aprobadas, 0 fallos. Se detuvo el proceso de base de datos y se reabrieron los mismos archivos WiredTiger. Esto comprueba persistencia local, no constituye todavía evidencia de volumen Docker.',y)
y=para('Pruebas adicionales de Chrome: CRUD, recarga, filtros, confirmación, móvil, búsqueda vacía y recuperación ante fallo de red. Compilación Vite correcta.',y)
c.showPage()
y=title('08 / Contenedores','Docker: implementación y límite')
y=para('<b>Pendiente de ejecutar:</b> este equipo no dispone de Docker Engine ni Docker Desktop. No se han generado capturas de contenedores ejecutándose ni se afirma que docker compose up --build haya sido probado.',y)
y=section('Configuración incluida',y)
y=para('Frontend: construcción multietapa con Node y servicio Nginx.<br/>Backend: Node 22, dependencias de producción, usuario sin privilegios.<br/>Base: imagen mongo:7.0 con volumen mongo_data.<br/>Compose: dependencias por salud, red interna y puertos locales configurables.',y)
y=code('docker compose up --build -d --wait\ndocker compose ps\ndocker compose exec backend node scripts/seed.js\n\n# Prueba de persistencia con down y up\nbash scripts/verificar-docker.sh',y)
y=para('El script comprueba HTTP a través del frontend, crea un registro, recrea los contenedores sin borrar el volumen, vuelve a consultar el registro y lo elimina. Guardará evidencia real en docs/docker-verificacion.txt cuando se ejecute.',y)
y=section('Instrucciones Dockerfile',y)
y=para('<b>FROM:</b> imagen base. <b>WORKDIR:</b> directorio de trabajo. <b>COPY:</b> incorpora archivos. <b>RUN:</b> ejecuta pasos de construcción. <b>EXPOSE:</b> documenta un puerto. <b>CMD:</b> comando de arranque. Los puertos publicados se definen en Compose.',y)
c.showPage()
y=title('09 / Entrega y conclusiones','Lo comprobado y lo pendiente')
y=section('Resultado',y)
y=para('Entrega resuelve una necesidad concreta con un flujo funcional Usuario -> React -> HTTP -> Express -> MongoDB. Se comprobó que crear, leer, modificar y eliminar cambia realmente la base; las validaciones evitan registros inconsistentes y la interfaz comunica errores.',y)
y=section('Artefactos',y)
y=para('Código y commits progresivos en Examen Global. README con instalación, modelo, API, puertos y entorno. Capturas en docs/capturas. Respuestas API y base de datos en JSON. Pruebas reproducibles. Este PDF y video técnico local en output/. Guion para defensa oral de menos de diez minutos.',y)
y=section('Pendientes antes de la entrega final',y)
y=para('1. Instalar/iniciar Docker y ejecutar scripts/verificar-docker.sh.<br/>2. Anexar evidencia real de construcción, servicios sanos y volumen.<br/>3. Completar la sección Docker y la defensa oral del video.<br/>4. Proporcionar nombre y materia para personalizar la portada.<br/>5. Autorizar la publicación del nuevo proyecto en un repositorio GitHub.',y)
y=para('<b>GitHub:</b> publicación pendiente. Destino propuesto: repositorio Cuh51229458-lang/Ultima-practica, rama examen-global. La revisión automática de permisos bloqueó ese envío por falta de autorización específica; no se presenta ese enlace como proyecto publicado.',y)
y=para('Conclusión: la aplicación local y su persistencia quedaron verificadas. La evaluación completa de la contenerización debe cerrarse con pruebas en un entorno Docker disponible.',y)
c.showPage();c.save();print(out/'evidencias-entrega.pdf')
