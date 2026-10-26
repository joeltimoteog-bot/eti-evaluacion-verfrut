/* Evaluaciones ETI · index.html · bloque 05-banco-respuestas (antes en la linea 5901) · extraido el 26-oct-2026 sin cambios (_EVAL_MODULAR_V1) */
/* ══════════════════════════════════════════════════════════════
   _BANCO_V1 (29-set-2026) — Alternativas y respuesta correcta de
   cada pregunta, para la calificación AUTOMÁTICA de la evaluación
   por QR. tq = texto que ve el trabajador (si difiere del original).
   tipo 'unica'    → una sola correcta: acierto = puntaje completo.
   tipo 'multiple' → varias correctas: puntaje proporcional
                     (aciertos − errores) / correctas, mínimo 0.
   revisar:true    → respuesta propia de la empresa: confírmala en
                     el panel 🧩 Banco de Preguntas.
   ══════════════════════════════════════════════════════════════ */
const ETI_OPS_BASE = {
 1:{tq:'¿Dónde puedes verificar cuánto te pagan al mes y tus descuentos?',tipo:'unica',ops:[
   ['En mi boleta de pago mensual',1],['Preguntando a un compañero',0],['En el contrato de otro trabajador',0],['No es posible saberlo',0]]},
 2:{tq:'¿Cuál es la jornada legal de trabajo?',tipo:'unica',ops:[
   ['8 horas diarias o 48 horas a la semana',1],['10 horas diarias o 60 horas a la semana',0],['6 horas diarias o 36 horas a la semana',0],['12 horas diarias sin límite semanal',0]]},
 3:{tq:'Si el jefe solicita trabajar horas extras (sobretiempo), ¿qué es lo correcto?',tipo:'unica',revisar:true,ops:[
   ['Es voluntario y se debe pagar o compensar',1],['Es obligatorio y no se paga',0],['Solo se paga si pasa de 12 horas',0],['Se descuenta del refrigerio',0]]},
 4:{tq:'¿Cómo debes registrar tu asistencia?',tipo:'unica',revisar:true,ops:[
   ['Marcando en el registro de asistencia al ingresar y al salir',1],['Solo marcando al ingresar',0],['Avisando por teléfono al supervisor',0],['No es necesario marcar',0]]},
 5:{tq:'¿Cuánto tiempo mínimo de refrigerio te corresponde por ley?',tipo:'unica',ops:[
   ['45 minutos',1],['15 minutos',0],['2 horas',0],['No me corresponde refrigerio',0]]},
 6:{tq:'Además de las vacaciones, ¿qué beneficios de ley te otorga la empresa? (Marca todas las correctas)',tipo:'multiple',ops:[
   ['Gratificaciones',1],['CTS (Compensación por Tiempo de Servicios)',1],['Seguro de salud EsSalud',1],['Asignación familiar (si tengo hijos menores)',1],['Pago de días no trabajados sin justificación',0],['Préstamos sin devolución',0]]},
 7:{tq:'¿Dónde encuentras el Reglamento Interno de Trabajo y tu boleta mensual de pago?',tipo:'unica',revisar:true,ops:[
   ['El Reglamento lo entrega/publica la empresa y la boleta la recibo cada mes (física o digital)',1],['Solo los tiene el sindicato',0],['No existen en la empresa',0],['Solo se pueden ver en la municipalidad',0]]},
 8:{tq:'¿Quién es la asistenta social?',tipo:'unica',revisar:true,ops:[
   ['La profesional de Gestión Humana que ve temas de bienestar de los trabajadores',1],['La persona que controla la producción',0],['La encargada de seguridad de la puerta',0],['No existe en la empresa',0]]},
 9:{tq:'¿Cómo se llama el grupo que representa a los trabajadores ante la empresa?',tipo:'unica',revisar:true,ops:[
   ['Comité / delegados de representantes de los trabajadores',1],['Comité de compras',0],['Grupo de supervisores de producción',0],['Área de logística',0]]},
 10:{tq:'Las quejas o sugerencias se dejan en los buzones azules, ¿dónde están?',tipo:'unica',revisar:true,ops:[
   ['En zonas comunes del fundo/planta (comedores, ingresos o áreas de descanso)',1],['Dentro de la oficina del gerente',0],['Solo en Lima',0],['No hay buzones',0]]},
 11:{tq:'Si tienes una queja o sugerencia, ¿con quién puedes hablar?',tipo:'unica',ops:[
   ['Con la asistenta social o el supervisor de Gestión Humana',1],['Con nadie, debo quedarme callado',0],['Solo con mis compañeros',0],['Con una persona ajena a la empresa',0]]},
 12:{tq:'¿Quién revisa los buzones de quejas y sugerencias?',tipo:'unica',revisar:true,ops:[
   ['El área de Gestión Humana, en los días establecidos por la empresa',1],['Cualquier trabajador cuando quiera',0],['Nadie los revisa',0],['El personal de vigilancia',0]]},
 13:{tq:'¿Dónde se publican las respuestas a las quejas o sugerencias?',tipo:'unica',revisar:true,ops:[
   ['En el periódico mural o panel informativo',1],['No se publican',0],['Solo se dicen en voz baja',0],['En las redes sociales personales',0]]},
 14:{tq:'Si un compañero te hace bromas de connotación sexual o te acosa, ¿a quién pides ayuda y denuncias?',tipo:'unica',ops:[
   ['A Gestión Humana / Comité de intervención frente al hostigamiento sexual',1],['A nadie, debo aguantar',0],['Solo a mis compañeros de ruta',0],['Al chofer del bus',0]]},
 15:{tq:'¿Cuántos días pagados de licencia por paternidad le corresponden al trabajador?',tipo:'unica',ops:[
   ['10 días calendario',1],['2 días',0],['30 días',0],['No le corresponde',0]]},
 16:{tq:'¿Cuántos días pagados de licencia por maternidad le corresponden a la trabajadora?',tipo:'unica',ops:[
   ['98 días',1],['30 días',0],['45 días',0],['15 días',0]]},
 17:{tq:'¿Cuántos días pagados puedes faltar por accidente grave o enfermedad terminal de un familiar directo?',tipo:'unica',ops:[
   ['Hasta 7 días calendario',1],['1 día',0],['30 días',0],['No existe esa licencia',0]]},
 18:{tq:'¿Cuántos días pagados puedes faltar si fallece un familiar directo?',tipo:'unica',ops:[
   ['5 días hábiles',1],['1 día',0],['15 días',0],['No existe esa licencia',0]]},
 19:{tq:'¿Qué beneficios adicionales (no obligatorios por ley) te otorga la empresa? (Marca todas las correctas)',tipo:'multiple',revisar:true,ops:[
   ['Celebración del Día de la Madre / del Padre',1],['Actividades por fiestas (Navidad, aniversario)',1],['Campañas de salud y bienestar',1],['Préstamos sin devolución',0],['Doble sueldo todos los meses',0]]},
 20:{tq:'¿Qué quiere decir que una empresa es "sustentable"?',tipo:'unica',ops:[
   ['Que produce cuidando el medio ambiente, a las personas y la economía, sin afectar a las futuras generaciones',1],['Que solo busca ganar más dinero',0],['Que tiene muchos trabajadores',0],['Que exporta a muchos países',0]]},
 21:{tq:'¿Cuántos son los Objetivos de Desarrollo Sostenible (ODS)?',tipo:'unica',ops:[
   ['17',1],['10',0],['5',0],['25',0]]},
 22:{tq:'¿Cuáles de estos son Objetivos de Desarrollo Sostenible (ODS)? (Marca todas las correctas)',tipo:'multiple',ops:[
   ['Fin de la pobreza',1],['Hambre cero',1],['Salud y bienestar',1],['Agua limpia y saneamiento',1],['Igualdad de género',1],['Más horas de trabajo',0],['Uso libre de plásticos',0]]},
 23:{tq:'Las ideas para cuidar el planeta y la sociedad se dejan en los buzones verdes, ¿dónde están?',tipo:'unica',revisar:true,ops:[
   ['En zonas comunes del fundo/planta junto a los paneles informativos',1],['En la oficina del gerente',0],['No existen',0],['Solo en la ciudad',0]]},
 24:{tq:'¿Quiénes revisan los buzones de ideas verdes?',tipo:'unica',revisar:true,ops:[
   ['El equipo de Sustentabilidad / Gestión Humana, en los días establecidos',1],['Cualquier trabajador',0],['Nadie los revisa',0],['El personal de vigilancia',0]]},
 25:{tq:'¿Qué otro nombre tienen las políticas de ética y buenas prácticas laborales?',tipo:'unica',revisar:true,ops:[
   ['Código de Conducta / Código de Ética',1],['Reglamento de tránsito',0],['Manual de cosecha',0],['Contrato de trabajo',0]]},
 26:{tq:'¿Cuáles son principios del Código de Conducta? (Marca todas las correctas)',tipo:'multiple',revisar:true,ops:[
   ['Honestidad e integridad',1],['Respeto a las personas',1],['Cumplimiento de la ley',1],['Transparencia',1],['Favoritismo',0],['Ocultar los errores',0]]},
 27:{tq:'¿Cómo demuestra una empresa que es ética?',tipo:'unica',ops:[
   ['Previniendo y reportando posibles delitos como fraude, corrupción o favoritismos',1],['Ocultando los problemas',0],['Pagando favores a funcionarios',0],['Contratando solo a familiares',0]]},
 28:{tq:'¿En qué momentos debes lavarte las manos? (Marca todas las correctas)',tipo:'multiple',ops:[
   ['Antes de comer',1],['Después de ir al baño',1],['Antes de iniciar labores o manipular la fruta',1],['Después de manipular químicos o residuos',1],['Solo una vez por semana',0]]},
 29:{tq:'¿Qué equipos de protección personal (EPP) se usan en el trabajo? (Marca todas las correctas)',tipo:'multiple',revisar:true,ops:[
   ['Guantes',1],['Botas o calzado de seguridad',1],['Mascarilla / protector respiratorio',1],['Lentes de seguridad',1],['Sandalias',0],['Ropa de fiesta',0]]},
 30:{tq:'¿Dónde se encuentran el tópico y el lactario?',tipo:'unica',revisar:true,ops:[
   ['En mi fundo/planta; el supervisor y los paneles indican su ubicación',1],['Solo en la ciudad',0],['No existen en la empresa',0],['En la casa de un compañero',0]]},
 31:{tq:'Si ocurre un accidente o te sientes mal de salud, ¿qué debes hacer?',tipo:'unica',ops:[
   ['Comunicar de inmediato a mi jefe o supervisor y acudir al tópico',1],['Seguir trabajando sin avisar',0],['Irme a casa sin decir nada',0],['Esperar al día siguiente',0]]},
 32:{tq:'¿Qué haces para cuidar el medio ambiente en tu área de trabajo? (Marca todas las correctas)',tipo:'multiple',ops:[
   ['Separar los residuos en los tachos correctos',1],['Ahorrar agua',1],['No quemar basura',1],['Botar residuos en el campo',0],['Dejar los caños abiertos',0]]},
 33:{tq:'¿Qué consecuencias trae el cambio climático? (Marca todas las correctas)',tipo:'multiple',ops:[
   ['Sequías y escasez de agua',1],['Lluvias intensas e inundaciones',1],['Aumento de la temperatura',1],['Pérdida de cultivos',1],['Más agua para todos siempre',0]]},
 34:{tq:'¿Cómo podemos proteger la biodiversidad de la empresa (animales, plantas nativas, reservorios)? (Marca todas las correctas)',tipo:'multiple',ops:[
   ['No cazar ni molestar a los animales',1],['No arrancar plantas nativas',1],['No contaminar los reservorios ni jardines',1],['Botar basura en los reservorios',0],['Cortar árboles sin permiso',0]]},
 35:{tq:'¿Qué debemos hacer para que los residuos estén bien manejados? (Marca todas las correctas)',tipo:'multiple',ops:[
   ['Separarlos según el color del tacho',1],['No mezclar residuos peligrosos con los comunes',1],['Reciclar lo que se pueda',1],['Quemarlos',0],['Enterrarlos en el campo',0]]},
 36:{tq:'¿Cómo podemos ahorrar energía en la empresa? (Marca todas las correctas)',tipo:'multiple',ops:[
   ['Apagar las luces que no se usan',1],['Desconectar equipos al terminar',1],['Aprovechar la luz natural',1],['Dejar equipos encendidos toda la noche',0],['Abrir la refrigeradora sin necesidad',0]]}
};

/* ══════════════════════════════════════════════════════════════
   _MODULOS_V1 (29-set-2026)
   1) 🧩 Banco de Preguntas y pesos  → solo el creador (jtimoteo)
   2) 🔐 Control de accesos por módulo → solo el creador
   3) 📱 Evaluación por QR (el trabajador responde desde su celular
      en evaluar.html; calificación automática; consolidado al cerrar)
   ══════════════════════════════════════════════════════════════ */
(function(){
'use strict';
const ETI_CREADOR='jtimoteo';
const COL_CFG='config_eti', DOC_BANCO='banco', DOC_ACC='accesos';
const COL_SES='sesiones_qr', COL_RESP='respuestas_qr', COL_BHIST='banco_historial';
const QR_SAL='ETI-QR';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const clon=o=>JSON.parse(JSON.stringify(o));
const pct=v=>(Math.round((v||0)*1000)/10).toFixed(1)+'%';
const esCreador=()=>!!(SESSION&&SESSION.rol==='admin'&&String(SESSION.user).toLowerCase()===ETI_CREADOR);
const hoyL=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
async function sha(txt){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(txt));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,16);}

/* ════════════════ 1) BANCO DE PREGUNTAS ════════════════ */
const SECS_ORIG=clon(SECS);
/* _PCT_PREGUNTA_V1 (03-oct-2026): cada pregunta tiene su % sobre el 100% total (p.pct).
   El peso del tema = suma de los % de sus preguntas (se calcula solo).
   p.max queda como escala de la evaluación manual (0–max); el QR califica directo en %.
   Bancos antiguos sin p.pct se migran conservando exactamente la ponderación anterior. */
const r4=v=>Math.round((+v||0)*10000)/10000;
function normPct(secs){
  (secs||[]).forEach(s=>{
    const mx=s.pregs.reduce((a,p)=>a+(+p.max||0),0);
    s.pregs.forEach(p=>{
      if(p.pct==null||p.pct===''||isNaN(+p.pct)) p.pct=mx?r4((+s.peso||0)*100*(+p.max||0)/mx):0;
      else p.pct=+p.pct;
    });
    s.peso=r4(s.pregs.filter(vbOk).reduce((a,p)=>a+p.pct,0)/100);   /* solo cuentan las que tienen visto bueno */
  });
  return secs;
}
/* _VISTO_BUENO_V1 (03-oct-2026): solo las preguntas con visto bueno (vb) salen en el QR y en la evaluación.
   vb no definido = true (bancos anteriores). */
const vbOk=p=>p&&p.vb!==false;
const soloVB=secs=>(secs||[]).map(s=>({...s,pregs:s.pregs.filter(vbOk)})).filter(s=>s.pregs.length);
const sumPct=secs=>r4((secs||[]).reduce((a,s)=>a+s.pregs.filter(vbOk).reduce((b,p)=>b+(+p.pct||0),0),0));
/* _BANCO_2026_V1 (03-oct-2026): banco actualizado según "REFUERZO ETI Ayuda Memoria 2026".
   Se carga con el botón 📥 del módulo; el % de cada pregunta lo define el creador (inicia en partes iguales).
   'SUS' = se conservan las preguntas de Sustentabilidad del banco anterior. */
const ETI_BANCO_COMPLETO=[{"id": "leg", "nom": "Legislación Laboral", "pregs": [{"t": "¿Sabes cuánto te pagan al mes? Escríbelo.", "tq": "¿Dónde puedes verificar cuánto te pagan al mes y tus descuentos?", "tipo": "unica", "ops": [{"t": "En mi boleta de pago, en la aplicación de Gestión Humana (o pidiéndola en cualquier oficina de Gestión Humana)", "ok": true}, {"t": "Preguntando a un compañero", "ok": false}, {"t": "En el contrato de otro trabajador", "ok": false}, {"t": "No es posible saberlo", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, {"t": "La jornada legal de trabajo son las horas que debemos trabajar, ¿cuántas horas tú trabajas al día y a la semana?", "tq": "¿Cuál es la jornada máxima legal de trabajo?", "tipo": "unica", "ops": [{"t": "8 horas diarias o 48 horas a la semana", "ok": true}, {"t": "10 horas diarias o 60 horas a la semana", "ok": false}, {"t": "6 horas diarias o 36 horas a la semana", "ok": false}, {"t": "12 horas diarias sin límite semanal", "ok": false}], "origen": "Anterior", "vb": true, "revisar": false}, {"t": "Si el jefe lo solicita, está permitido hacer sobretiempo, ¿cuántas horas extras podemos hacer como máximo al día o en una semana?", "tq": "Si tu jefe te pide horas extras (sobretiempo), ¿qué es lo correcto?", "tipo": "unica", "ops": [{"t": "Son voluntarias: hasta 2 horas extras al día y como máximo 12 a la semana", "ok": true}, {"t": "Son obligatorias y no se pagan", "ok": false}, {"t": "Puedo hacer todas las que pida el jefe, sin límite", "ok": false}, {"t": "Solo se pagan si paso de 12 horas al día", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, {"t": "¿Dónde debes marcar tu asistencia al entrar y salir? Indica la hora de ingreso y de salida.", "tq": "¿Cómo registras tu ingreso y tu salida?", "tipo": "unica", "ops": [{"t": "En los marcadores del bus, al bajar en el campo", "ok": true}, {"t": "Firmando un cuaderno en la garita", "ok": false}, {"t": "Avisando por teléfono al supervisor", "ok": false}, {"t": "No es necesario registrarlo", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, {"t": "¿Cuánto tiempo tienes de refrigerio para comer o descansar?", "tq": "¿Cuánto tiempo de refrigerio te corresponde?", "tipo": "unica", "ops": [{"t": "45 minutos: empieza cuando dejo mi línea o cuartel y termina cuando vuelvo a mi faena", "ok": true}, {"t": "15 minutos", "ok": false}, {"t": "2 horas", "ok": false}, {"t": "No me corresponde refrigerio", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, {"t": "¿Qué beneficios de acuerdo a la Ley te otorga la empresa además de las vacaciones?", "tq": "¿Qué beneficios tiene el trabajador del régimen laboral agrario? (Marca todas las correctas)", "tipo": "multiple", "ops": [{"t": "Asignación familiar", "ok": true}, {"t": "Vacaciones", "ok": true}, {"t": "Utilidades", "ok": true}, {"t": "Seguro Vida Ley", "ok": true}, {"t": "EsSalud", "ok": true}, {"t": "Préstamos sin devolución", "ok": false}, {"t": "Pago de días faltados sin justificación", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, {"t": "¿Sabes dónde encontrar el Reglamento Interno de Trabajo y la boleta mensual de pago?", "tq": "¿Dónde encuentras el Reglamento Interno de Trabajo, el Código de Conducta, tu contrato y tus boletas de pago?", "tipo": "unica", "ops": [{"t": "En la aplicación de Gestión Humana, donde se firman digitalmente (desde computadora, tablet o celular)", "ok": true}, {"t": "Solo los tiene el sindicato", "ok": false}, {"t": "No se entregan al trabajador", "ok": false}, {"t": "Solo se pueden ver en la municipalidad", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, {"t": "¿En qué régimen laboral has sido contratado?", "tq": "", "tipo": "unica", "ops": [{"t": "Régimen laboral agrario", "ok": true}, {"t": "Régimen de construcción civil", "ok": false}, {"t": "Régimen de la pequeña empresa", "ok": false}, {"t": "Régimen del sector público", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Qué tipos de contrato tiene la empresa? (Marca todas las correctas)", "tq": "", "tipo": "multiple", "ops": [{"t": "Contrato de modalidad intermitente", "ok": true}, {"t": "Contrato por incremento de actividades", "ok": true}, {"t": "Locación de servicios con recibo por honorarios", "ok": false}, {"t": "Contrato verbal, sin firmar nada", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "Para conseguir el trabajo, ¿alguien te puede cobrar dinero?", "tq": "", "tipo": "unica", "ops": [{"t": "No. Nadie debe cobrarme por darme trabajo; si pasa, lo reporto en la oficina principal de Gestión Humana", "ok": true}, {"t": "Sí, es normal pagarle a la persona que te hace ingresar", "ok": false}, {"t": "Sí, pero solo la primera campaña", "ok": false}, {"t": "Sí, y se descuenta de la boleta", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Cómo te pagan la CTS y la gratificación?", "tq": "", "tipo": "unica", "ops": [{"t": "Se incluyen como un porcentaje en mi remuneración", "ok": true}, {"t": "Se pagan solo cuando termina el contrato", "ok": false}, {"t": "No me corresponden", "ok": false}, {"t": "Se pagan una vez al año en efectivo", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Quién paga EsSalud?", "tq": "", "tipo": "unica", "ops": [{"t": "La empresa lo paga; no se descuenta de mi sueldo", "ok": true}, {"t": "Se descuenta de mi sueldo", "ok": false}, {"t": "Lo pago yo directamente en EsSalud", "ok": false}, {"t": "Nadie, es gratis", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Cuál es la Remuneración Mínima Vital (RMV) desde octubre de 2026?", "tq": "", "tipo": "unica", "ops": [{"t": "S/ 1,230.00", "ok": true}, {"t": "S/ 1,130.00", "ok": false}, {"t": "S/ 1,025.00", "ok": false}, {"t": "S/ 1,500.00", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿En cuántas partes al mes te pagan tu salario?", "tq": "", "tipo": "unica", "ops": [{"t": "En dos partes: el adelanto quincenal y a fin de mes", "ok": true}, {"t": "En una sola parte, a fin de mes", "ok": false}, {"t": "Cada semana", "ok": false}, {"t": "Cada dos meses", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "Si no puedes entrar a la plataforma, ¿cómo obtienes tu boleta de pago?", "tq": "", "tipo": "unica", "ops": [{"t": "Solicitándola en cualquier oficina de Gestión Humana", "ok": true}, {"t": "No se puede obtener", "ok": false}, {"t": "Pidiéndosela a un compañero", "ok": false}, {"t": "Solo al terminar el contrato", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "En el Perú, ¿desde qué edad pueden trabajar los menores de 18 años?", "tq": "", "tipo": "unica", "ops": [{"t": "Desde los 14 años", "ok": true}, {"t": "Desde los 10 años", "ok": false}, {"t": "Desde los 16 años", "ok": false}, {"t": "No pueden trabajar en ningún caso", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "En el régimen agrario, ¿pueden trabajar los menores de 18 años?", "tq": "", "tipo": "unica", "ops": [{"t": "No. No se permite el trabajo infantil; solo desde los 18 años", "ok": true}, {"t": "Sí, desde los 14 años", "ok": false}, {"t": "Sí, con permiso de los padres", "ok": false}, {"t": "Sí, solo en temporada alta", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}]}, {"id": "bie", "nom": "Bienestar Social", "pregs": [{"t": "¿Conoces a la asistenta social? Escribe su nombre.", "tq": "¿Quién es la asistenta social de la empresa?", "tipo": "unica", "ops": [{"t": "La Lic. Rubí Figueroa, de Bienestar Social", "ok": true}, {"t": "La persona que controla la producción", "ok": false}, {"t": "La encargada de seguridad de la puerta", "ok": false}, {"t": "No existe en la empresa", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, {"t": "¿Cómo se llama el comité o grupo de representantes de los trabajadores? Si conoces a algún representante, escribe su nombre.", "tq": "¿Cómo se llama el comité que representa a los trabajadores?", "tipo": "unica", "ops": [{"t": "Comité de Bienestar del Trabajador", "ok": true}, {"t": "Comité de compras", "ok": false}, {"t": "Grupo de supervisores de producción", "ok": false}, {"t": "Área de logística", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, {"t": "Las quejas o sugerencias se pueden dejar en los buzones azules, ¿dónde están estos buzones?", "tq": "Las quejas o sugerencias se dejan en los buzones azules, ¿dónde están?", "tipo": "unica", "ops": [{"t": "En los comedores e ingresos peatonales de cada campo", "ok": true}, {"t": "Dentro de la oficina del gerente", "ok": false}, {"t": "Solo en Lima", "ok": false}, {"t": "No hay buzones", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, {"t": "Si tienes una queja o una sugerencia, ¿con quién puedes hablar?", "tq": "Si quieres hacer una queja o sugerencia, ¿a qué canales puedes acudir? (Marca todas las correctas)", "tipo": "multiple", "ops": [{"t": "Buzones azules de quejas y sugerencias", "ok": true}, {"t": "Asistenta Social (Lic. Rubí Figueroa)", "ok": true}, {"t": "Representante del Comité de Bienestar del Trabajador", "ok": true}, {"t": "QR de canales de quejas de Unifrutti o Tesco", "ok": true}, {"t": "Mi jefe directo o el supervisor de Gestión Humana", "ok": true}, {"t": "Mis redes sociales personales", "ok": false}, {"t": "El personal de vigilancia de la garita", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, {"t": "¿Sabes quién revisa los buzones de sugerencias y quejas y qué días los revisa?", "tq": "¿Quiénes revisan los buzones de quejas y sugerencias? (Marca todas las correctas)", "tipo": "multiple", "ops": [{"t": "El Comité de Bienestar del Trabajador", "ok": true}, {"t": "La Asistenta Social", "ok": true}, {"t": "Gestión Humana", "ok": true}, {"t": "El personal de vigilancia", "ok": false}, {"t": "Cualquier trabajador", "ok": false}, {"t": "El chofer del bus", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, {"t": "¿Dónde se publica el registro de respuestas a las quejas o sugerencias?", "tq": "¿Dónde y qué día se publican las respuestas a las quejas o sugerencias?", "tipo": "unica", "ops": [{"t": "En los periódicos murales de Bienestar Social, todos los jueves", "ok": true}, {"t": "No se publican", "ok": false}, {"t": "En redes sociales, una vez al mes", "ok": false}, {"t": "Se avisan de boca en boca los lunes", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, {"t": "Si un compañero te realiza bromas de connotación sexual o te acosa sexualmente, ¿a quién debes pedirle ayuda y realizar tu denuncia?", "tq": "Si un compañero te hace bromas de connotación sexual o te acosa, ¿con quién denuncias?", "tipo": "unica", "ops": [{"t": "Con la Asistenta Social", "ok": true}, {"t": "Con nadie, debo aguantar", "ok": false}, {"t": "Solo con mis compañeros de ruta", "ok": false}, {"t": "Con el chofer del bus", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, {"t": "Cuando un trabajador hombre tiene un bebé, puede pedir un permiso que se llama \"licencia de paternidad\", ¿cuántos días pagados puede faltar con esta licencia?", "tq": "¿Cuántos días pagados de licencia por paternidad le corresponden al trabajador?", "tipo": "unica", "ops": [{"t": "10 días calendario", "ok": true}, {"t": "2 días", "ok": false}, {"t": "30 días", "ok": false}, {"t": "No le corresponde", "ok": false}], "origen": "Anterior", "vb": true, "revisar": false}, {"t": "Cuando una trabajadora mujer tiene un bebé, puede pedir un permiso que se llama \"licencia de maternidad\", ¿cuántos días pagados puede faltar con esta licencia?", "tq": "¿Cuántos días pagados de licencia por maternidad le corresponden a la trabajadora?", "tipo": "unica", "ops": [{"t": "98 días", "ok": true}, {"t": "30 días", "ok": false}, {"t": "45 días", "ok": false}, {"t": "15 días", "ok": false}], "origen": "Anterior", "vb": true, "revisar": false}, {"t": "¿Cuántos días pagados puedes faltar cuando pides la licencia por accidente grave o enfermedad terminal de un familiar directo?", "tq": "¿Cuántos días pagados puedes faltar por accidente grave o enfermedad terminal de un familiar directo?", "tipo": "unica", "ops": [{"t": "7 días calendario", "ok": true}, {"t": "1 día", "ok": false}, {"t": "30 días", "ok": false}, {"t": "No existe esa licencia", "ok": false}], "origen": "Anterior", "vb": true, "revisar": false}, {"t": "¿Cuántos días pagados puedes faltar si fallece un familiar directo?", "tq": "¿Cuántos días pagados puedes faltar si fallece un familiar directo?", "tipo": "unica", "ops": [{"t": "5 días calendario si fallece en la región Piura y 7 días si fallece fuera de Piura", "ok": true}, {"t": "1 día", "ok": false}, {"t": "15 días", "ok": false}, {"t": "No existe esa licencia", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, {"t": "¿Qué otros beneficios adicionales, distintos a los de ley, te otorga la empresa? (Ejemplo: Celebración del día de la madre o del padre)", "tq": "¿Qué beneficios adicionales (no obligatorios por ley) te otorga la empresa? (Marca todas las correctas)", "tipo": "multiple", "ops": [{"t": "Celebración del Día de la Madre / del Padre", "ok": true}, {"t": "Actividades por fiestas (Navidad, aniversario)", "ok": true}, {"t": "Campañas de salud y bienestar", "ok": true}, {"t": "Préstamos sin devolución", "ok": false}, {"t": "Doble sueldo todos los meses", "ok": false}], "origen": "Anterior", "vb": true, "revisar": true}, {"t": "¿Cuáles de estos canales de quejas son anónimos? (Marca todas las correctas)", "tq": "", "tipo": "multiple", "ops": [{"t": "El buzón de quejas y sugerencias", "ok": true}, {"t": "Los QR de canales de quejas", "ok": true}, {"t": "La Asistenta Social", "ok": false}, {"t": "Mi jefe directo", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Qué día se abren los buzones de quejas y sugerencias?", "tq": "", "tipo": "unica", "ops": [{"t": "Todos los viernes", "ok": true}, {"t": "Una vez al mes", "ok": false}, {"t": "Solo en diciembre", "ok": false}, {"t": "Nunca se abren", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Dónde encuentras los QR para poner una queja?", "tq": "", "tipo": "unica", "ops": [{"t": "En los periódicos murales", "ok": true}, {"t": "En la boleta de pago", "ok": false}, {"t": "En la puerta del bus", "ok": false}, {"t": "No existen", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Te pueden amonestar por hacer una queja?", "tq": "", "tipo": "unica", "ops": [{"t": "No. Las quejas son confidenciales y sin represalias", "ok": true}, {"t": "Sí, si la queja es contra mi jefe", "ok": false}, {"t": "Sí, con un descuento", "ok": false}, {"t": "Sí, si no pongo mi nombre", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Cómo ubicas a la Asistenta Social o al Comité?", "tq": "", "tipo": "unica", "ops": [{"t": "Al Comité en el campo; a la Asistenta Social en la oficina de Bienestar Social o con su teléfono de los periódicos murales", "ok": true}, {"t": "Solo por redes sociales", "ok": false}, {"t": "No es posible ubicarlos", "ok": false}, {"t": "Solo en Lima", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}]}, "SUS", {"id": "eti", "nom": "Ética Empresarial", "pregs": ["OLD25", {"t": "El código de conducta tiene 11 principios, ¿cuáles recuerdas? Escribe al menos tres.", "tq": "¿Cuáles son principios del Código de Conducta? (Marca todas las correctas)", "tipo": "multiple", "ops": [{"t": "No trabajo infantil", "ok": true}, {"t": "Trabajo de libre elección y no forzoso", "ok": true}, {"t": "Seguridad y salud en el trabajo", "ok": true}, {"t": "Libertad de asociación y negociación colectiva", "ok": true}, {"t": "No discriminación", "ok": true}, {"t": "Protección especial para trabajadores jóvenes", "ok": true}, {"t": "Horario de trabajo no excesivo", "ok": true}, {"t": "Remuneración digna", "ok": true}, {"t": "Trabajo no precario", "ok": true}, {"t": "Medio ambiente", "ok": true}, {"t": "Comportamiento empresarial ético", "ok": true}, {"t": "Favoritismo", "ok": false}, {"t": "Horas extras obligatorias y sin pago", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, "OLD27", {"t": "¿Cuántos principios tiene el Código de Conducta?", "tq": "", "tipo": "unica", "ops": [{"t": "11 principios", "ok": true}, {"t": "5 principios", "ok": false}, {"t": "7 principios", "ok": false}, {"t": "20 principios", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Qué significa “trabajo de libre elección y no forzoso”?", "tq": "", "tipo": "unica", "ops": [{"t": "No se cobra por contratar, no retienen mi DNI y puedo renunciar en cualquier momento sin penalidad", "ok": true}, {"t": "La empresa guarda mi DNI hasta que termine el contrato", "ok": false}, {"t": "No puedo renunciar hasta que termine la campaña", "ok": false}, {"t": "Debo quedarme dentro de la empresa aunque termine mi turno", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Qué significa “no discriminación”?", "tq": "", "tipo": "unica", "ops": [{"t": "Nadie es tratado distinto por su raza, color, sexo, procedencia, etnia, edad, capacidades físicas o religión", "ok": true}, {"t": "Solo se contrata a personas de la zona", "ok": false}, {"t": "Se prefiere a los trabajadores jóvenes", "ok": false}, {"t": "Solo se respeta una religión", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Qué significa “protección especial para trabajadores jóvenes”?", "tq": "", "tipo": "unica", "ops": [{"t": "Los menores de 21 años reciben capacitaciones completas sobre prevención de riesgos y su labor", "ok": true}, {"t": "Los jóvenes trabajan más horas", "ok": false}, {"t": "Los jóvenes no reciben EPP", "ok": false}, {"t": "Los jóvenes no firman contrato", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Qué significa “remuneración digna”?", "tq": "", "tipo": "unica", "ops": [{"t": "Se cumple lo del contrato y se paga puntual, al 3.er día hábil de cumplida la quincena", "ok": true}, {"t": "Se paga cuando la empresa puede", "ok": false}, {"t": "Se paga menos que la remuneración mínima", "ok": false}, {"t": "Se paga solo al final de la campaña", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Qué significa “comportamiento empresarial ético”?", "tq": "", "tipo": "unica", "ops": [{"t": "No participar en actividades ilegales (trata de personas, tráfico de sustancias, narcotráfico) ni hacer negocios con quien lo haga", "ok": true}, {"t": "Ganar dinero de cualquier forma", "ok": false}, {"t": "Hacer favores a funcionarios para ganar contratos", "ok": false}, {"t": "Ocultar los problemas de la empresa", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}]}, {"id": "sst", "nom": "Seguridad y Salud en el Trabajo", "pregs": [{"t": "¿Conoces el procedimiento de lavado de manos? Escribe al menos dos momentos en los que debes lavarte las manos.", "tq": "¿Cuándo debes lavarte las manos? (Marca todas las correctas)", "tipo": "multiple", "ops": [{"t": "Antes y después de ir al baño", "ok": true}, {"t": "Antes y después de comer", "ok": true}, {"t": "Después de tocar cosas sucias", "ok": true}, {"t": "Solo al final del día", "ok": false}, {"t": "Solo si se ven sucias", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, "OLD29", "OLD30", {"t": "Si ocurre un accidente o te sientes mal de Salud, ¿a quién le comunicas y cómo te comunicas?", "tq": "Si hay una emergencia, una caída, te sientes mal o tienes dolor, ¿qué debes hacer?", "tipo": "unica", "ops": [{"t": "Avisar de inmediato a mi supervisor o jefe inmediato para que llame al tópico", "ok": true}, {"t": "Seguir trabajando sin avisar", "ok": false}, {"t": "Irme a casa sin decir nada", "ok": false}, {"t": "Esperar al día siguiente", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, "OLD32", {"t": "¿Por qué debes usar en todo momento los EPP que te entregan? (Marca todas las correctas)", "tq": "", "tipo": "multiple", "ops": [{"t": "Para evitar accidentes", "ok": true}, {"t": "Para no cortarme", "ok": true}, {"t": "Para que no me caigan objetos extraños en los ojos", "ok": true}, {"t": "Solo cuando está el supervisor", "ok": false}, {"t": "Solo para las auditorías", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Cómo debes llevar las tijeras y herramientas punzocortantes?", "tq": "", "tipo": "unica", "ops": [{"t": "En su funda y con la punta siempre hacia abajo", "ok": true}, {"t": "En el bolsillo con la punta hacia arriba", "ok": false}, {"t": "En la mano, apuntando hacia adelante", "ok": false}, {"t": "Sin funda, para usarlas más rápido", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Cómo debes toser o estornudar?", "tq": "", "tipo": "unica", "ops": [{"t": "Tapándome con el antebrazo", "ok": true}, {"t": "Tapándome con la mano", "ok": false}, {"t": "Sin taparme", "ok": false}, {"t": "Bajándome la mascarilla", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Con qué atención de salud cuenta la empresa?", "tq": "", "tipo": "unica", "ops": [{"t": "Tres tópicos, con enfermeros/as y un médico ocupacional", "ok": true}, {"t": "Un solo tópico, en Lima", "ok": false}, {"t": "Ninguna, debo ir por mi cuenta", "ok": false}, {"t": "Solo una farmacia", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}]}, {"id": "med", "nom": "Compromiso Medioambiental", "pregs": ["OLD33", {"t": "En la empresa tenemos animalitos, zonas con plantas nativas, jardines y reservorios con peces, ¿cómo podemos ayudar a proteger esta biodiversidad?", "tq": "¿Cómo protegemos a los animales silvestres, plantas nativas, jardines y reservorios? (Marca todas las correctas)", "tipo": "multiple", "ops": [{"t": "No quemar ni arrancar las plantas", "ok": true}, {"t": "No cazar ni sacrificar animales", "ok": true}, {"t": "No llevarse animales para venderlos o criarlos", "ok": true}, {"t": "No pescar en los reservorios", "ok": true}, {"t": "No tener animales en cautiverio", "ok": true}, {"t": "Pescar solo los fines de semana", "ok": false}, {"t": "Llevarse crías a casa para cuidarlas", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, {"t": "Todos los desperdicios tienen una forma distinta de separarse, ¿qué debemos hacer para que los desechos estén bien manejados? Escribe al menos tres.", "tq": "¿Dónde se colocan los residuos? (Marca todas las correctas)", "tipo": "multiple", "ops": [{"t": "En los contenedores de colores, según el tipo de residuo", "ok": true}, {"t": "No mezclar residuos peligrosos con los comunes", "ok": true}, {"t": "Reciclar madera, cartón y plástico", "ok": true}, {"t": "Quemarlos", "ok": false}, {"t": "Enterrarlos en el campo", "ok": false}], "origen": "Anterior · actualizada con Ayuda Memoria 2026", "vb": true, "revisar": false}, "OLD36", {"t": "¿Qué residuos van en el contenedor BLANCO?", "tq": "", "tipo": "unica", "ops": [{"t": "Plástico (mangueras, botellas, bolsas, PVC)", "ok": true}, {"t": "Papel y cartón", "ok": false}, {"t": "Residuos no aprovechables (envolturas de galletas, descartables, servilletas, residuos de SS.HH.)", "ok": false}, {"t": "Metales (retazos, alambres, fierros)", "ok": false}, {"t": "Residuos peligrosos (EPP contaminados, envases de agroquímicos, trapos con grasa, envases de aceite)", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Qué residuos van en el contenedor AZUL?", "tq": "", "tipo": "unica", "ops": [{"t": "Plástico (mangueras, botellas, bolsas, PVC)", "ok": false}, {"t": "Papel y cartón", "ok": true}, {"t": "Residuos no aprovechables (envolturas de galletas, descartables, servilletas, residuos de SS.HH.)", "ok": false}, {"t": "Metales (retazos, alambres, fierros)", "ok": false}, {"t": "Residuos peligrosos (EPP contaminados, envases de agroquímicos, trapos con grasa, envases de aceite)", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Qué residuos van en el contenedor NEGRO?", "tq": "", "tipo": "unica", "ops": [{"t": "Plástico (mangueras, botellas, bolsas, PVC)", "ok": false}, {"t": "Papel y cartón", "ok": false}, {"t": "Residuos no aprovechables (envolturas de galletas, descartables, servilletas, residuos de SS.HH.)", "ok": true}, {"t": "Metales (retazos, alambres, fierros)", "ok": false}, {"t": "Residuos peligrosos (EPP contaminados, envases de agroquímicos, trapos con grasa, envases de aceite)", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Qué residuos van en el contenedor AMARILLO?", "tq": "", "tipo": "unica", "ops": [{"t": "Plástico (mangueras, botellas, bolsas, PVC)", "ok": false}, {"t": "Papel y cartón", "ok": false}, {"t": "Residuos no aprovechables (envolturas de galletas, descartables, servilletas, residuos de SS.HH.)", "ok": false}, {"t": "Metales (retazos, alambres, fierros)", "ok": true}, {"t": "Residuos peligrosos (EPP contaminados, envases de agroquímicos, trapos con grasa, envases de aceite)", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "¿Qué residuos van en el contenedor ROJO?", "tq": "", "tipo": "unica", "ops": [{"t": "Plástico (mangueras, botellas, bolsas, PVC)", "ok": false}, {"t": "Papel y cartón", "ok": false}, {"t": "Residuos no aprovechables (envolturas de galletas, descartables, servilletas, residuos de SS.HH.)", "ok": false}, {"t": "Metales (retazos, alambres, fierros)", "ok": false}, {"t": "Residuos peligrosos (EPP contaminados, envases de agroquímicos, trapos con grasa, envases de aceite)", "ok": true}], "origen": "Nueva 2026", "vb": false, "revisar": false}, {"t": "Si ves un mal manejo ambiental, ¿cómo lo reportas? (Marca todas las correctas)", "tq": "", "tipo": "multiple", "ops": [{"t": "En cualquier buzón verde", "ok": true}, {"t": "Con los supervisores de BPA", "ok": true}, {"t": "Con mi jefe directo", "ok": true}, {"t": "Publicándolo en mis redes sociales", "ok": false}, {"t": "No se reporta", "ok": false}], "origen": "Nueva 2026", "vb": false, "revisar": false}]}];
/* _BANCO_COMPLETO_V1: anteriores (con respuesta actualizada donde coinciden con la Ayuda Memoria 2026) + nuevas 2026.
   Anteriores: con visto bueno. Nuevas: sin visto bueno hasta que el creador las apruebe. 'SUS' y 'OLDnn' = tal cual estaban. */
function banco2026(){
  const base=bancoBase(), porN={}; base.forEach(s=>s.pregs.forEach(p=>porN[p.n]=p));
  const marca=p=>Object.assign(clon(p),{origen:'Anterior',vb:true});
  const secs=ETI_BANCO_COMPLETO.map(x=>{
    if(x==='SUS'){const s=clon(base.find(b=>b.id==='sus'));s.pregs=s.pregs.map(marca);return s;}
    return {id:x.id,nom:x.nom,peso:0,pregs:x.pregs.map(p=>{
      if(typeof p==='string') return marca(porN[+p.slice(3)]);
      return {n:0,t:p.t,tq:p.tq||'',max:2,pct:0,tipo:p.tipo,revisar:!!p.revisar,origen:p.origen,vb:p.vb!==false,ops:clon(p.ops)};})};
  });
  const ps=secs.flatMap(x=>x.pregs), vs=ps.filter(vbOk), v=r4(100/vs.length); let n=1;
  ps.forEach(p=>{p.n=n++;p.pct=vbOk(p)?v:0;}); vs[vs.length-1].pct=r4(100-v*(vs.length-1));
  return normPct(secs);
}
function bancoBase(){
  return normPct(SECS_ORIG.map(s=>({id:s.id,nom:s.nom,peso:s.peso,pregs:s.pregs.map(p=>{
    const b=(typeof ETI_OPS_BASE!=='undefined'&&ETI_OPS_BASE[p.n])||{};
    return {n:p.n,t:p.t,tq:b.tq||'',max:p.max,tipo:b.tipo||'unica',revisar:!!b.revisar,
      ops:(b.ops||[['Sí',1],['No',0]]).map(o=>({t:o[0],ok:!!o[1]}))};
  })})));
}
let BANCO=bancoBase(), bancoMeta=null;
function nPregs(){return SECS.reduce((a,s)=>a+s.pregs.length,0);}
function aplicarBanco(secs){
  SECS.length=0;
  soloVB(normPct(clon(secs))).forEach(c=>{
    c.pregs.forEach(p=>{p.f=(+p.max>0)?p.pct/(+p.max):0;});   /* factor: puntaje manual → % del total */
    c.maxSec=r4(c.pregs.reduce((a,p)=>a+p.pct,0));             /* máximo del tema, en % */
    SECS.push(c);});
  document.querySelectorAll('.n-pregs').forEach(e=>e.textContent=nPregs());
}
window.etiNPregs=nPregs;
aplicarBanco(BANCO);

function validarBanco(secs){
  const err=[];
  normPct(secs);
  const tot=sumPct(secs);
  if(!secs.some(s=>s.pregs.some(vbOk))) err.push('Ninguna pregunta tiene visto bueno: dale ✅ a las que deben salir en la evaluación.');
  if(Math.abs(tot-100)>0.05) err.push(`Los % de las preguntas con visto bueno suman ${tot.toFixed(2)}% (deben sumar 100%).`);
  secs.forEach(s=>{
    if(!String(s.nom).trim()) err.push('Hay una sección sin nombre.');

    s.pregs.forEach((p,i)=>{
      const q=`${s.nom} · pregunta ${i+1}`;
      if(!String(p.t).trim()) err.push(`${q}: falta el texto.`);
      if(vbOk(p)&&!(+p.pct>0)) err.push(`${q}: tiene visto bueno pero falta su % (debe ser mayor a 0).`);
      if(!(+p.max>0)) err.push(`${q}: el puntaje de la evaluación manual debe ser mayor a 0.`);
      const ops=p.ops.filter(o=>String(o.t).trim());
      if(ops.length<2) err.push(`${q}: necesita al menos 2 alternativas.`);
      const ok=ops.filter(o=>o.ok).length;
      if(!ok) err.push(`${q}: marca cuál es la respuesta correcta.`);
      if(p.tipo==='unica'&&ok>1) err.push(`${q}: es de respuesta única pero tiene ${ok} correctas.`);
    });
  });
  return err;
}

let draft=null, draftSucio=false, bkFiltro='', bkVB='';
function bkMarcar(){draftSucio=true;const b=$('bk-guardar');if(b){b.disabled=false;b.classList.add('pulso');}bkResumen();}
function bkResumen(){
  const el=$('bk-resumen'); if(!el||!draft) return;
  normPct(draft);
  draft.forEach((s,si)=>{const e=$('bk-sp-'+si);if(e)e.textContent=(+(s.peso*100).toFixed(2))+'%';});
  const tot=sumPct(draft), np=draft.reduce((a,s)=>a+s.pregs.length,0);
  const rev=draft.reduce((a,s)=>a+s.pregs.filter(p=>p.revisar).length,0), nvb=draft.reduce((a,s)=>a+s.pregs.filter(vbOk).length,0);
  const okP=Math.abs(tot-100)<0.05;
  el.innerHTML=`
    <div class="m-kpi"><b>${draft.length}</b><span>Secciones</span></div>
    <div class="m-kpi"><b>${np}</b><span>Preguntas en el banco</span></div>
    <div class="m-kpi ok"><b>${nvb}</b><span>✅ Con visto bueno (salen en la evaluación)</span></div>
    <div class="m-kpi ${np-nvb?'warn':'ok'}"><b>${np-nvb}</b><span>Sin visto bueno (no salen)</span></div>
    <div class="m-kpi ${okP?'ok':'bad'}"><b>${+tot.toFixed(2)}%</b><span>Suma de % (con visto bueno) ${okP?'✓':(tot<100?`(faltan ${+(100-tot).toFixed(2)}%)`:`(sobran ${+(tot-100).toFixed(2)}%)`)}</span>
      ${okP||!(tot>0)?'':`<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.5rem"><button class="btn bpri bsm" onclick="ETIM.bkAjustar()" title="Mantiene la importancia relativa de cada pregunta y lleva el total a 100%">⚖ Ajustar a 100% (proporcional)</button><button class="btn bout bsm" onclick="ETIM.bkIgualar()">Repartir en partes iguales</button></div>`}</div>
    <div class="m-kpi ${rev?'warn':'ok'}"><b>${rev}</b><span>Por confirmar</span></div>
    <div class="m-pesobar">${draft.map((s,i)=>`<i style="width:${(+s.peso||0)*100}%;background:${['#003DA5','#C8102E','#007A3D','#7A4FD0','#E08A00','#0096A6','#555'][i%7]}" title="${esc(s.nom)} ${((+s.peso||0)*100).toFixed(1)}%"></i>`).join('')}</div>`;
}
function renderBanco(){
  const box=$('admin-banco'); if(!box) return;
  if(!esCreador()){box.innerHTML='<div class="m-empty">🔒 Solo el creador del sistema puede modificar el banco de preguntas.</div>';return;}
  if(!draft){draft=clon(BANCO);draftSucio=false;}
  const f=bkFiltro.toLowerCase();
  box.innerHTML=`
  <div class="m-head">
    <div><h2 class="m-tit">🧩 Banco de Preguntas</h2>
      <p class="m-sub">Preguntas, alternativas, respuesta correcta y <b>% de cada pregunta sobre el 100%</b>. El peso de cada tema se calcula solo (suma de sus preguntas). En el QR la nota se calcula automáticamente: si acierta suma su %, si falla suma 0 (en las de varias correctas, proporcional). Los cambios se aplican a la evaluación manual y a la evaluación por QR.
      ${bancoMeta?`<br><span class="m-mut">Versión ${bancoMeta.version||1} · guardada por ${esc(bancoMeta.por||'—')} · ${bancoMeta.en?new Date(bancoMeta.en).toLocaleString('es-PE'):''}</span>`:'<br><span class="m-mut">Usando el banco base (aún no guardado en la nube).</span>'}</p></div>
    <div class="m-acts">
      <input class="fc m-buscar" placeholder="🔎 Buscar pregunta…" value="${esc(bkFiltro)}" oninput="ETIM.bkBuscar(this.value)">
      <select class="fc" style="width:auto" onchange="ETIM.bkVerVB(this.value)"><option value="" ${!bkVB?'selected':''}>Todas</option><option value="si" ${bkVB==='si'?'selected':''}>✅ Con visto bueno</option><option value="no" ${bkVB==='no'?'selected':''}>⬜ Sin visto bueno</option><option value="nueva" ${bkVB==='nueva'?'selected':''}>🆕 Nuevas 2026</option><option value="act" ${bkVB==='act'?'selected':''}>✏️ Actualizadas</option></select>
      <button class="btn bpri bsm" onclick="ETIM.bkCargar2026()" title="Anteriores (con respuestas actualizadas) + nuevas de la Ayuda Memoria 2026. No se guarda hasta que presiones Guardar">📥 Cargar banco completo</button>
      <button class="btn bout bsm" onclick="ETIM.bkRestaurar()">↺ Restaurar base</button>
      <button class="btn bout bsm" onclick="ETIM.bkIgualar()" title="Pone el mismo % a todas las preguntas (100% ÷ N)">⚖ Repartir 100% en partes iguales</button>
      <button class="btn bout bsm" onclick="ETIM.bkAddSec()">➕ Sección</button>
      <button class="btn bout bsm" onclick="ETIM.cuestionarioPDF(false)" title="Cuestionario vigente sin claves (para auditoría / aplicar en papel)">📄 Cuestionario PDF</button>
      <button class="btn bout bsm" onclick="ETIM.cuestionarioPDF(true)" title="Cuestionario con las respuestas correctas marcadas (solo admin)">🔑 Con claves</button>
      <button class="btn bpri bsm" id="bk-guardar" onclick="ETIM.bkGuardar()" ${draftSucio?'':'disabled'}>💾 Guardar cambios</button>
    </div>
  </div>
  <div class="m-resumen" id="bk-resumen"></div>
  ${draft.map((s,si)=>{
    const pregs=s.pregs.map((p,pi)=>({p,pi})).filter(x=>!f||(x.p.t+' '+x.p.tq+' '+x.p.ops.map(o=>o.t).join(' ')).toLowerCase().includes(f))
      .filter(x=>!bkVB||(bkVB==='si'&&vbOk(x.p))||(bkVB==='no'&&!vbOk(x.p))||(bkVB==='nueva'&&/Nueva/.test(x.p.origen||''))||(bkVB==='act'&&/actualizada/.test(x.p.origen||'')));
    if(bkVB&&!pregs.length) return '';
    if(f&&!pregs.length) return '';
    const maxSec=s.pregs.reduce((a,p)=>a+(+p.max||0),0);
    return `<div class="m-sec">
      <div class="m-sechead">
        <input class="fc m-secnom" value="${esc(s.nom)}" oninput="ETIM.bkSet(${si},-1,'nom',this.value)">
        <span class="m-peso" title="Suma de los % de sus preguntas">Peso del tema <b id="bk-sp-${si}">${+((+s.peso||0)*100).toFixed(2)}%</b></span>
        <span class="m-chip">${s.pregs.filter(vbOk).length} de ${s.pregs.length} con ✅</span>
        <button class="btn bout bsm" title="Reparte el % actual del tema en partes iguales entre sus preguntas" onclick="ETIM.bkIgualarSec(${si})">⚖ Igualar</button>
        <button class="m-ico" title="Eliminar sección" onclick="ETIM.bkDelSec(${si})">🗑</button>
      </div>
      ${pregs.map(({p,pi})=>`
      <div class="m-preg ${p.revisar?'rev':''}" style="${vbOk(p)?'':'opacity:.62;background:#F6F7FA'}">
        <div class="m-pnum">${pi+1}</div>
        <div class="m-pbody">
          <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-bottom:.4rem">
            <button class="btn ${vbOk(p)?'bpri':'bout'} bsm" onclick="ETIM.bkSet(${si},${pi},'vb',${!vbOk(p)},1)" title="Solo las preguntas con visto bueno salen en el QR y en la evaluación">${vbOk(p)?'✅ Visto bueno · sale en la evaluación':'⬜ Sin visto bueno · no sale'}</button>
            ${p.origen?`<span class="m-chip" style="${/Nueva/.test(p.origen)?'background:#E6F7EE;color:#007A3D':/actualizada/.test(p.origen)?'background:#FFF4E5;color:#B86E00':''}">${esc(p.origen)}</span>`:''}
          </div>
          <label class="m-lbl">Texto de la pregunta (evaluación manual)</label>
          <textarea class="fc" rows="2" oninput="ETIM.bkSet(${si},${pi},'t',this.value)">${esc(p.t)}</textarea>
          <label class="m-lbl">Texto que ve el trabajador en el QR <span class="m-mut">(vacío = usa el de arriba)</span></label>
          <textarea class="fc" rows="2" oninput="ETIM.bkSet(${si},${pi},'tq',this.value)">${esc(p.tq)}</textarea>
          <div class="m-prow">
            <label class="m-lbl" style="font-weight:800;color:var(--navy,#003DA5)">% de la pregunta <input class="fc m-num" type="number" min="0" max="100" step="0.01" value="${+(+p.pct||0).toFixed(4)}" oninput="ETIM.bkSet(${si},${pi},'pct',this.value)"> %</label>
            <label class="m-lbl">Puntaje eval. manual <input class="fc m-num" type="number" min="0.5" step="0.5" value="${p.max}" oninput="ETIM.bkSet(${si},${pi},'max',this.value)"></label>
            <label class="m-lbl">Tipo
              <select class="fc m-sel" onchange="ETIM.bkSet(${si},${pi},'tipo',this.value,1)">
                <option value="unica" ${p.tipo==='unica'?'selected':''}>Una sola respuesta correcta</option>
                <option value="multiple" ${p.tipo==='multiple'?'selected':''}>Varias correctas (puntaje proporcional)</option>
              </select></label>
            <button class="m-rev ${p.revisar?'on':''}" onclick="ETIM.bkSet(${si},${pi},'revisar',${!p.revisar},1)">${p.revisar?'⚠ Por confirmar':'✓ Confirmada'}</button>
          </div>
          <div class="m-ops">
            ${p.ops.map((o,oi)=>`<div class="m-op ${o.ok?'ok':''}">
              <label class="m-okbox" title="Respuesta correcta"><input type="${p.tipo==='unica'?'radio':'checkbox'}" name="ok-${si}-${pi}" ${o.ok?'checked':''} onchange="ETIM.bkOk(${si},${pi},${oi},this.checked)"><span>${o.ok?'Correcta':'Incorrecta'}</span></label>
              <input class="fc" value="${esc(o.t)}" placeholder="Texto de la alternativa" oninput="ETIM.bkOpT(${si},${pi},${oi},this.value)">
              <button class="m-ico" title="Quitar alternativa" onclick="ETIM.bkDelOp(${si},${pi},${oi})">✕</button>
            </div>`).join('')}
            <button class="btn bout bsm" onclick="ETIM.bkAddOp(${si},${pi})">+ Alternativa</button>
          </div>
        </div>
        <div class="m-pacts">
          <button class="m-ico" title="Subir" onclick="ETIM.bkMover(${si},${pi},-1)">▲</button>
          <button class="m-ico" title="Bajar" onclick="ETIM.bkMover(${si},${pi},1)">▼</button>
          <button class="m-ico" title="Eliminar" onclick="ETIM.bkDelPreg(${si},${pi})">🗑</button>
        </div>
      </div>`).join('')}
      <div style="display:flex;gap:.5rem;flex-wrap:wrap"><button class="btn bout bsm m-addp" onclick="ETIM.bkAddPreg(${si})">➕ Agregar pregunta (alternativas) a ${esc(s.nom)}</button>
      <button class="btn bout bsm m-addp" onclick="ETIM.bkAddPreg(${si},1)">➕ Agregar Verdadero / Falso</button></div>
    </div>`;}).join('')}`;
  bkResumen();
}
const BK={
  bkVerVB(v){bkVB=v;renderBanco();},
  bkBuscar(v){bkFiltro=v;renderBanco();const i=document.querySelector('.m-buscar');if(i){i.focus();i.setSelectionRange(v.length,v.length);}},
  bkSet(si,pi,k,v,re){
    if(!esCreador()) return;
    const o=pi<0?draft[si]:draft[si].pregs[pi];
    if(k==='peso') v=(parseFloat(v)||0)/100;
    if(k==='max'||k==='pct') v=parseFloat(v)||0;
    if(k==='vb'&&v&&!(+o.pct>0)){const vs=draft.flatMap(x=>x.pregs).filter(vbOk);o.pct=vs.length?r4(100/(vs.length+1)):100;}   /* al dar visto bueno sin %: se le sugiere un % (ajusta luego con ⚖) */
    o[k]=v;
    if(k==='tipo'&&v==='unica'){let vis=false;o.ops.forEach(x=>{if(x.ok&&!vis)vis=true;else x.ok=false;});}
    bkMarcar(); if(re) renderBanco();
  },
  bkOk(si,pi,oi,chk){const p=draft[si].pregs[pi];if(p.tipo==='unica')p.ops.forEach((o,i)=>o.ok=i===oi);else p.ops[oi].ok=chk;bkMarcar();renderBanco();},
  bkOpT(si,pi,oi,v){draft[si].pregs[pi].ops[oi].t=v;bkMarcar();},
  bkAddOp(si,pi){draft[si].pregs[pi].ops.push({t:'',ok:false});bkMarcar();renderBanco();},
  bkDelOp(si,pi,oi){const p=draft[si].pregs[pi];if(p.ops.length<=2){toast('Cada pregunta necesita al menos 2 alternativas','e');return;}p.ops.splice(oi,1);bkMarcar();renderBanco();},
  /* _AGREGAR_PREG_V2 (06-oct-2026): la pregunta nueva entra SIN visto bueno (no altera la evaluación ni los % hasta que la apruebes) */
  bkAddPreg(si,vf){
    const ops=vf?[{t:'Verdadero',ok:true},{t:'Falso',ok:false}]:[{t:'',ok:true},{t:'',ok:false},{t:'',ok:false}];
    draft[si].pregs.push({n:0,t:'',tq:'',max:2,pct:0,tipo:'unica',revisar:false,vb:false,origen:'Agregada',ops});
    bkMarcar();renderBanco();
    setTimeout(()=>{const ps=document.querySelectorAll('#admin-banco .m-sec')[si];const ult=ps&&ps.querySelectorAll('.m-preg');const el=ult&&ult[ult.length-1];
      if(el){el.scrollIntoView({behavior:'smooth',block:'center'});const t=el.querySelector('textarea');if(t)t.focus();}},80);
    toast(vf?'➕ Pregunta Verdadero/Falso agregada: escribe la afirmación y marca cuál es la correcta. Dale ✅ cuando esté lista.':'➕ Pregunta agregada: escribe el texto y las alternativas. Dale ✅ cuando esté lista.','i');
  },
  bkDelPreg(si,pi){confMod('¿Eliminar la pregunta?',draft[si].pregs[pi].t||'(sin texto)',()=>{draft[si].pregs.splice(pi,1);bkMarcar();renderBanco();});},
  bkMover(si,pi,d){const a=draft[si].pregs,j=pi+d;if(j<0||j>=a.length)return;[a[pi],a[j]]=[a[j],a[pi]];bkMarcar();renderBanco();},
  bkCargar2026(){
    confMod('¿Cargar el banco completo?','Se cargan TODAS las preguntas: las anteriores (con la respuesta actualizada donde coinciden con la Ayuda Memoria 2026) con ✅ visto bueno, y las nuevas 2026 sin visto bueno para que tú decidas cuáles salen. Nada se guarda hasta que presiones "Guardar cambios".',()=>{draft=banco2026();bkMarcar();renderBanco();});
  },
  /* _AJUSTE_100_V1 (07-oct-2026): lleva los % con visto bueno a 100% manteniendo su proporción */
  bkAjustar(){
    const ps=draft.flatMap(s=>s.pregs).filter(vbOk), tot=ps.reduce((a,p)=>a+(+p.pct||0),0);
    if(!ps.length||!(tot>0)){toast('Primero da ✅ a las preguntas y ponles un %','i');return;}
    let acc=0; ps.forEach((p,i)=>{if(i<ps.length-1){p.pct=r4((+p.pct||0)*100/tot);acc+=p.pct;}else p.pct=r4(100-acc);});
    bkMarcar(); renderBanco(); toast('✅ Listo: los '+ps.length+' % suman 100%. Ahora presiona 💾 Guardar cambios.','s');
  },
  bkIgualar(){
    const ps=draft.flatMap(s=>s.pregs).filter(vbOk); if(!ps.length){toast('Primero da ✅ visto bueno a las preguntas que saldrán','i');return;}
    confMod('¿Repartir 100% en partes iguales?',`Cada una de las ${ps.length} preguntas con visto bueno quedará con ${+(100/ps.length).toFixed(4)}%. Las que no tienen visto bueno no cuentan. Luego puedes ajustar una por una.`,()=>{
      const v=r4(100/ps.length); ps.forEach(p=>p.pct=v); ps[ps.length-1].pct=r4(100-v*(ps.length-1));
      bkMarcar(); renderBanco();});
  },
  bkIgualarSec(si){
    const s=draft[si], ps=s.pregs.filter(vbOk), n=ps.length; if(!n){toast('Este tema no tiene preguntas con visto bueno','i');return;}
    const tot=r4(ps.reduce((a,p)=>a+(+p.pct||0),0));
    if(!(tot>0)){toast('Primero escribe el % de alguna pregunta del tema, o usa "Repartir 100%"','i');return;}
    const v=r4(tot/n); ps.forEach(p=>p.pct=v); ps[n-1].pct=r4(tot-v*(n-1));
    bkMarcar(); renderBanco();
  },
  bkAddSec(){draft.push({id:'s'+Date.now().toString(36),nom:'Nueva sección',peso:0,pregs:[]});bkMarcar();renderBanco();},
  bkDelSec(si){confMod('¿Eliminar la sección completa?',`"${draft[si].nom}" y sus ${draft[si].pregs.length} preguntas.`,()=>{draft.splice(si,1);bkMarcar();renderBanco();});},
  /* _CUESTIONARIO_PDF_V1 (16-oct-2026): cuestionario del banco vigente listo para Guardar como PDF (evidencia para auditoría). conClaves=true solo admin. */
  cuestionarioPDF(conClaves){
    const adm=SESSION&&SESSION.rol==='admin'; if(conClaves&&!adm){toast('Solo el administrador puede ver las claves','e');return;}
    const secs=soloVB(BANCO||SECS||[]); if(!secs.length){toast('No hay banco de preguntas cargado','e');return;}
    const w=window.open('','_blank'); if(!w){toast('Activa los pop-ups para este sitio y vuelve a intentar','e');return;}
    let logo='';try{logo=getComputedStyle(document.documentElement).getPropertyValue('--logo').trim();}catch(e){}
    const L='ABCDEFGHIJ'; let n=0, total=secs.reduce((a,x)=>a+x.pregs.length,0);
    const cuerpo=secs.map((sec,si)=>`<div class="sec"><div class="stit">Tema ${si+1} · ${esc(sec.nom)}${adm?` <span class="peso">(peso ${(+(sec.peso*100)).toFixed(0)}%)</span>`:''}</div>`+
      sec.pregs.map(p=>{n++;const ops=(p.ops||[]).filter(o=>String(o.t||'').trim());
        return `<div class="q"><div class="qt">${n}. ${esc(p.tq||p.t)}${p.tipo==='multiple'?' <i>(puede marcar varias)</i>':''}</div>`+
          ops.map((o,i)=>`<div class="op${conClaves&&o.ok?' ok':''}">${conClaves&&o.ok?'☑':'☐'} ${L[i]||i+1}) ${esc(o.t)}</div>`).join('')+`</div>`;}).join('')+`</div>`).join('');
    w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Cuestionario ETI v${bancoMeta&&bancoMeta.version||''}${conClaves?' - CON CLAVES':''}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,Helvetica,sans-serif;color:#111;font-size:11pt;background:#fff}
@media screen{.instruccion{position:fixed;top:0;left:0;right:0;z-index:9;background:#003DA5;color:#fff;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:14px}.btn-imprimir{background:#C8102E;color:#fff;border:none;padding:8px 20px;border-radius:6px;font-size:14px;font-weight:700;cursor:pointer}body{padding-top:70px}}
@media print{.instruccion{display:none!important}body{padding-top:0!important}@page{margin:14mm;size:A4 portrait}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.doc{max-width:800px;margin:0 auto;padding:10px 18px}.hd{display:flex;gap:14px;align-items:center;border-bottom:3px solid #003DA5;padding-bottom:10px;margin-bottom:12px}.hd .lg{width:52px;height:64px;background:${logo} center/contain no-repeat}
.hd h1{font-size:15pt;color:#003DA5}.hd .sub{font-size:9.5pt;color:#444;margin-top:3px}.datos{display:grid;grid-template-columns:repeat(3,1fr);gap:6px 14px;font-size:10pt;margin:8px 0 14px;border:1px solid #C0CEEA;border-radius:6px;padding:8px 10px;background:#F5F7FA}
.datos b{display:block;font-size:8pt;color:#4A5A80;text-transform:uppercase}.datos span{display:block;border-bottom:1px dotted #999;min-height:18px}
.sec{margin-bottom:10px}.stit{background:#003DA5;color:#fff;font-weight:800;padding:5px 9px;border-radius:4px;margin:12px 0 6px;font-size:10.5pt}.peso{font-weight:400;opacity:.85}
.q{page-break-inside:avoid;margin:6px 0 8px}.qt{font-weight:700;margin-bottom:3px}.qt i{font-weight:400;color:#555;font-size:9.5pt}.op{margin-left:18px;padding:1px 0;font-size:10.5pt}.op.ok{color:#007A3D;font-weight:800}
.pie{margin-top:16px;font-size:8.5pt;color:#555;border-top:1px solid #bbb;padding-top:6px}${conClaves?'.marca{position:fixed;top:40%;left:10%;font-size:60pt;color:rgba(200,16,46,.08);transform:rotate(-25deg);font-weight:900;pointer-events:none}':''}</style></head><body>
<div class="instruccion"><div><strong>📄 Guardar como PDF</strong> &nbsp;<span style="font-size:12px;opacity:.85">Destino = "Guardar como PDF" → Guardar</span></div><button class="btn-imprimir" onclick="window.print()">🖨️ Guardar como PDF</button></div>
${conClaves?'<div class="marca">CON CLAVES · USO INTERNO</div>':''}
<div class="doc"><div class="hd"><div class="lg"></div><div><h1>Evaluación de Conocimiento ETI</h1><div class="sub">Buenas Prácticas Sociales y Laborales · VERFRUT S.A.C. / RAPEL S.A.C. – Unifrutti Group · Gestión Humana – Relaciones Laborales</div><div class="sub">Banco de preguntas versión <b>${esc(String(bancoMeta&&bancoMeta.version||'—'))}</b> · ${total} preguntas · ${secs.length} temas · Emitido ${new Date().toLocaleDateString('es-PE')}${conClaves?' · <b style="color:#C8102E">CON CLAVES</b>':''}</div></div></div>
<div class="datos"><div><b>Empresa</b><span></span></div><div><b>Sector / Fundo</b><span></span></div><div><b>Fecha</b><span></span></div><div><b>Ruta / Área</b><span></span></div><div><b>Código de ruta</b><span></span></div><div><b>Supervisor</b><span></span></div></div>
<p style="font-size:9.5pt;color:#333;margin-bottom:6px"><b>Instrucciones:</b> marque con una X la alternativa que considere correcta. Criterio de aprobación: 70 %. La evaluación es anónima: no escriba su nombre ni DNI.</p>
${cuerpo}<div class="pie">Sistema ETI – Evaluaciones · Documento generado automáticamente · ${new Date().toLocaleString('es-PE')}</div></div></body></html>`);
    w.document.close(); toast('✅ Cuestionario abierto — usa "Guardar como PDF"','s');
  },
  bkRestaurar(){confMod('¿Restaurar el banco base?','Se cargarán las 36 preguntas originales con sus alternativas sugeridas. No se guarda hasta que presiones "Guardar cambios".',()=>{draft=bancoBase();bkMarcar();renderBanco();});},
  async bkGuardar(){
    if(!esCreador()){toast('Solo el creador puede guardar el banco','e');return;}
    draft.forEach(s=>s.pregs.forEach(p=>p.ops=p.ops.filter(o=>String(o.t).trim())));
    const err=validarBanco(draft);
    if(err.length){toast('⚠ '+err[0]+(err.length>1?` (+${err.length-1} más)`:''),'e');renderBanco();return;}
    let n=1; draft.forEach(s=>s.pregs.forEach(p=>p.n=n++));
    const doc={secs:clon(draft),version:((bancoMeta&&bancoMeta.version)||0)+1,por:SESSION.user,en:new Date().toISOString(),ts:Date.now()};
    if(!fbdb){toast('Sin conexión a la nube','e');return;}
    try{
      await fbdb.collection(COL_CFG).doc(DOC_BANCO).set(doc);
      ((window.RLProgreso&&RLProgreso.silencio)||(f=>f()))(()=>fbdb.collection(COL_BHIST).add(doc)).catch(()=>{});   /* _PROGRESO_ETI_V1: historial en 2do plano */
      draftSucio=false; toast(`✅ Banco guardado (versión ${doc.version}). Actualizando QR permanentes…`,'s');
      actualizarPermanentes(secsQR(doc.secs),doc.version).then(n=>toast(`✅ Banco v${doc.version} guardado · ${n} QR permanente(s) ya muestran las preguntas nuevas`,'s')).catch(e=>toast('Banco guardado, pero no se pudo actualizar los QR permanentes: '+e.message,'e'));
    }catch(e){console.error(e);toast('No se pudo guardar: '+e.message,'e');}
  }
};

/* ════════════════ 2) ACCESOS POR MÓDULO ════════════════ */
const MODS=[{k:'eval',ico:'📋',nom:'Nueva evaluación (manual)'},{k:'qr',ico:'📱',nom:'Evaluación por QR'},{k:'dash',ico:'📊',nom:'Dashboard'},{k:'ult',ico:'🧾',nom:'Último reporte'},{k:'ind',ico:'📈',nom:'Indicadores'},{k:'qrc',ico:'➕',nom:'Crear QR (normalmente solo admin)'}];
const modOn=(r,k)=>k==='qrc'?!!(r.mods&&r.mods.qrc===true):!(r.mods&&r.mods[k]===false);
let ACC={usuarios:{}}, accDraft=null;
function tiene(k){
  if(!SESSION) return false;
  if(SESSION.rol==='admin') return true;
  const u=ACC.usuarios[String(SESSION.user).toLowerCase()];
  if(!u) return k!=='qrc';
  if(u.activo===false) return false;
  if(k==='qrc') return !!(u.mods&&u.mods.qrc===true);   /* crear QR: apagado salvo que el admin lo active */
  return !(u.mods&&u.mods[k]===false);
}
window.etiTieneAcceso=tiene;
/* _USUARIOS_NUBE_V1 */
window.etiAccData=()=>ACC;
window.etiUsrNube=async(user,patch)=>{
  if(!fbdb) throw new Error('Sin conexión a la nube');
  const k=String(user).toLowerCase();
  await fbdb.collection(COL_CFG).doc(DOC_ACC).set({usuarios:{[k]:patch},por:SESSION.user,en:new Date().toISOString()},{merge:true});
  ACC.usuarios[k]=Object.assign(ACC.usuarios[k]||{},patch); accDraft=null;
};
/* pausa (false) o reactiva (true) los QR permanentes asignados al usuario */
window.etiQRDeUsuario=async(user,activar)=>{
  if(!fbdb) return 0;
  const k=String(user).toLowerCase();
  const q=await fbdb.collection(COL_SES).where('permanente','==',true).where('asignado','==',k).get(); let n=0;
  for(const d of q.docs){const x=d.data();
    if(!activar&&x.estado==='abierta'){await d.ref.update({estado:'cerrada',pausaMotivo:'usuario',pausadoEn:new Date().toISOString()});n++;}
    if(activar&&x.estado!=='abierta'&&x.pausaMotivo==='usuario'){await d.ref.update({estado:'abierta',pausaMotivo:null});n++;}}
  return n;
};
/* _QR_TODOS_V1 (03-oct-2026): candidatos a QR = supervisores de la lista de Gestión + usuarios del módulo Usuarios */
function candidatosQR(){
  const adm=SUPERVISORES.filter(x=>x.rol==='Administrador').map(x=>x.nom);
  const out=SUPERVISORES.filter(x=>x.rol!=='Administrador').map(x=>({nom:x.nom,sector:x.multiSector||x.reemplazante?'':(x.sector||''),user:userDeSup(x.nom),fuente:'Gestión'}));
  getUsuarios().filter(u=>u.rol!=='admin').forEach(u=>{
    if(adm.some(n=>n===u.nom||_cumCoincide(n,u.nom))) return;
    if(out.some(o=>o.nom===u.nom||_cumCoincide(o.nom,u.nom))) return;
    out.push({nom:u.nom,sector:'',user:u.user,fuente:'Usuarios'});
  });
  return out.filter(x=>!usrOff(x.nom)).sort((a,b)=>a.nom.localeCompare(b.nom));
}
/* usuarios agregados antes solo en este navegador → se suben a la nube (una vez por carga, solo admin) */
window.etiSubirExtras=function(){
  try{if(!SESSION||SESSION.rol!=='admin'||window._extrasSubidos||!fbdb)return;window._extrasSubidos=true;
    const loc=JSON.parse(localStorage.getItem('eti_usuarios_extra')||'[]')||[];
    loc.forEach(u=>{const k=String(u.user).toLowerCase();if(!ACC.usuarios[k]||!ACC.usuarios[k].extra)window.etiUsrNube(k,{extra:true,nom:u.nom,rol:u.rol||'supervisor'}).catch(()=>{});});
  }catch(e){}
};
const usrOff=nom=>{const u=getUsuarios(true).find(x=>x.rol!=='admin'&&(x.nom===nom||_cumCoincide(x.nom,nom)));if(!u)return false;const r=ACC.usuarios[String(u.user).toLowerCase()]||{};return !!(r.eliminado||r.activo===false);};
function aplicarAccesosMenu(){
  const g=document.querySelector('#sm .mgrid'); if(!g||!SESSION||SESSION.rol==='admin') return;
  const map={'iniciar()':'eval','irDash()':'dash','verUlt()':'ult','ETIM.abrirQR()':'qr'};
  let vis=0;
  g.querySelectorAll('.mc').forEach(c=>{const k=map[c.getAttribute('onclick')];if(!k)return;const s=tiene(k);c.style.display=s?'':'none';if(s)vis++;});
  let av=$('acc-aviso');
  const u=ACC.usuarios[String(SESSION.user).toLowerCase()];
  const txt=u&&u.activo===false?'🔒 Tu acceso a Evaluaciones ETI está suspendido. Comunícate con el administrador.':(!vis?'🔒 No tienes módulos asignados. Comunícate con el administrador.':'');
  if(txt){if(!av){av=document.createElement('div');av.id='acc-aviso';av.className='m-aviso';g.parentNode.insertBefore(av,g);}av.textContent=txt;}
  else if(av) av.remove();
}
function renderAccesos(){
  const box=$('admin-accesos'); if(!box) return;
  if(!esCreador()){box.innerHTML='<div class="m-empty">🔒 Solo el creador del sistema puede gestionar accesos.</div>';return;}
  if(!accDraft) accDraft=clon(ACC);
  const us=getUsuarios().filter(u=>u.rol!=='admin');
  const reg=u=>accDraft.usuarios[u]||(accDraft.usuarios[u]={activo:true,mods:{}});
  box.innerHTML=`
  <div class="m-head"><div><h2 class="m-tit">🔐 Control de accesos</h2>
    <p class="m-sub">Define qué módulos ve cada usuario en su menú. Los cambios se aplican al instante en todos los dispositivos. El administrador siempre tiene acceso total.</p></div>
    <div class="m-acts"><button class="btn bout bsm" onclick="ETIM.accTodos(true)">✓ Todo a todos</button><button class="btn bpri bsm" id="acc-guardar" onclick="ETIM.accGuardar()">💾 Guardar accesos</button></div></div>
  <div class="m-tablewrap m-acc"><table class="m-table">
    <thead><tr><th>Usuario</th><th>Estado</th>${MODS.map(m=>`<th>${m.ico}<br><small>${m.nom}</small></th>`).join('')}</tr></thead>
    <tbody>${us.map(u=>{const k=String(u.user).toLowerCase(),r=reg(k);return `<tr class="${r.activo===false?'off':''}">
      <td><div class="m-usr"><span class="m-av">${esc(String(u.nom).split(' ').filter(w=>/^[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(w)).slice(0,2).map(w=>w[0]).join('').toUpperCase())}</span><div><b>${esc(u.nom)}</b><br><span class="m-mut">${esc(u.user)} · ${r.activo===false?'sin acceso':MODS.filter(m=>modOn(r,m.k)).length+' de '+MODS.length+' módulos'}</span></div></div></td>
      <td><label class="m-sw"><input type="checkbox" ${r.activo!==false?'checked':''} onchange="ETIM.accSet('${k}','activo',this.checked)"><i></i><span>${r.activo!==false?'Activo':'Suspendido'}</span></label></td>
      ${MODS.map(m=>`<td><label class="m-sw"><input type="checkbox" ${r.activo===false?'disabled':''} ${modOn(r,m.k)?'checked':''} onchange="ETIM.accSet('${k}','${m.k}',this.checked)"><i></i></label></td>`).join('')}
    </tr>`;}).join('')}</tbody></table></div>`;
}
const AC={
  accSet(u,k,v){const r=accDraft.usuarios[u]||(accDraft.usuarios[u]={activo:true,mods:{}});if(k==='activo')r.activo=v;else{r.mods=r.mods||{};r.mods[k]=v;}renderAccesos();},
  accTodos(v){Object.values(accDraft.usuarios).forEach(r=>{r.activo=true;r.mods={};MODS.forEach(m=>r.mods[m.k]=v);});renderAccesos();},
  async accGuardar(){
    if(!esCreador()||!fbdb){toast('No autorizado o sin conexión','e');return;}
    try{await fbdb.collection(COL_CFG).doc(DOC_ACC).set({usuarios:accDraft.usuarios,por:SESSION.user,en:new Date().toISOString()});toast('✅ Accesos guardados','s');}
    catch(e){toast('No se pudo guardar: '+e.message,'e');}
  }
};

/* ════════════════ 3) EVALUACIÓN POR QR ════════════════ */
function urlEval(id){const u=new URL('evaluar.html',location.href);u.hash='';u.search='?s='+id;return u.href;}
function idSesion(){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';const r=crypto.getRandomValues(new Uint8Array(8));r.forEach(b=>s+=a[b%a.length]);return s;}
/* _QR_PERMANENTE_V1 (03-oct-2026): QR fijo por supervisor que SIEMPRE abre la evaluación vigente.
   Al guardar el banco, todos los QR permanentes se actualizan solos (mismo código, preguntas nuevas). */
function secsQR(secs){return soloVB(normPct(clon(secs))).map(c=>{c.maxSec=r4(c.pregs.reduce((a,p)=>a+(+p.pct||0),0));return c;});}
async function actualizarPermanentes(secs,ver){
  if(!fbdb) return 0;
  const q=await fbdb.collection(COL_SES).where('permanente','==',true).get(); let n=0;
  for(const d of q.docs){
    try{await d.ref.update({banco:await bancoPublico(d.id,secs),bancoVersion:ver,areas:(typeof AREAS!=='undefined'?AREAS.slice():[]),actualizadoEn:new Date().toISOString()});n++;}
    catch(e){console.warn('QR permanente '+d.id,e);}
  }
  return n;
}
const empTxt=s=>s&&s.emp?s.emp:'VERFRUT / RAPEL';
async function bancoPublico(id,secsIn){
  return Promise.all((secsIn||SECS).map(async s=>({id:s.id,nom:s.nom,peso:s.peso,maxSec:s.maxSec,
    pregs:await Promise.all(s.pregs.map(async p=>{
      const ops=(p.ops||[]).filter(o=>String(o.t).trim());
      const k=[];for(let i=0;i<ops.length;i++) if(ops[i].ok) k.push(await sha(`${id}|${p.n}|${i}|${QR_SAL}`));
      return {n:p.n,t:p.tq||p.t,max:p.pct,tipo:p.tipo||'unica',ops:ops.map(o=>o.t),k};   /* _PCT_PREGUNTA_V1: max = % de la pregunta (no se muestra al trabajador) */
    }))})));
}
function miSup(){
  if(!SESSION) return null;
  return SUPERVISORES.find(s=>s.nom===SESSION.nom)||SUPERVISORES.find(s=>_cumCoincide(s.nom,SESSION.nom))||null;
}
let sesActiva=null, unsubSes=null, unsubResp=null, sesiones=[], respuestas=[];

/* _QR_ASIGNADO_V3 (30-set-2026): el admin crea el QR y lo ASIGNA a un supervisor; el supervisor lo ve y lo muestra.
   El admin puede editar/eliminar sesiones y respuestas (Azure + Firebase).
   _QR_ANONIMO_V2 (30-set-2026): la sesión ya no fija ruta; cada trabajador (anónimo)
   elige su sector/fundo e indica su ruta y código. Al cerrar se agrupa por sector → ruta+código. */
function crearPantallaQR(){
  if($('sqr')) return;
  const d=document.createElement('div'); d.className='screen'; d.id='sqr';
  d.innerHTML=`
  <header class="hdr"><div class="logo">ETICA<span>·</span>SOCIAL <span class="m-crumb">› Evaluación por QR</span></div>
    <div style="display:flex;align-items:center;gap:.6rem;"><button class="btn bpri bsm" onclick="ETIM.qrManual()" title="El supervisor registra la evaluación manualmente (sin QR)">📋 Evaluación manual</button><button class="btn bgho bsm" onclick="volverAdmin()">← Menú</button><div class="logo-uni" role="img" aria-label="Unifrutti" style="height:36px;"></div></div></header>
  <div class="m-wrap">
    <div id="qr-manualbar" style="display:flex;justify-content:space-between;align-items:center;gap:.7rem;flex-wrap:wrap;background:#fff;border:1px solid #D9E0EC;border-left:5px solid #6A3FC0;border-radius:14px;padding:.8rem 1rem;margin-bottom:1rem;box-shadow:0 4px 14px rgba(0,30,90,.06)">
      <div><b style="font-size:.95rem">📋 Evaluación manual</b><div class="m-mut" style="font-size:.8rem">¿Sin celulares o sin señal? El supervisor registra la evaluación directamente en el sistema.</div></div>
      <button class="btn bpri" style="padding:.6rem 1.1rem" onclick="ETIM.qrManual()">📋 Hacer evaluación manual</button>
    </div>
    <div class="m-qrgrid">
      <section class="m-card" id="qr-form">
        <h2 class="m-tit">📱 Crear QR de evaluación</h2>
        <p class="m-sub">Genera el QR y muéstralo. La evaluación es <b>anónima</b> y es un solo QR para todo el personal: al escanear, el trabajador indica si es <b>obrero</b> (sector, ruta y código) o <b>empleado</b> (área y sector/zona donde está). El puntaje se calcula solo con el % de cada pregunta.</p>
        <div class="m-f2">
          <div class="fg"><label class="fl">Tipo de QR *</label><select class="fc" id="qr-clase" onchange="ETIM.qrClase()"><option value="perm" selected>📌 Permanente (siempre la evaluación vigente)</option><option value="dia">📅 Especial, para una fecha</option></select></div>
          <div class="fg" id="qr-fecha-g" style="display:none"><label class="fl">Fecha *</label><input class="fc" type="date" id="qr-fecha"></div>
        </div>
        <div class="m-f2">
          <div class="fg"><label class="fl">Empresa *</label><select class="fc" id="qr-emp"><option value="*">🏢 El trabajador elige (VERFRUT / RAPEL)</option><option>VERFRUT S.A.C.</option><option>RAPEL S.A.C.</option></select></div>
        </div>
        <div class="fg"><label class="fl">Asignar a (supervisor que mostrará el QR) *</label><select class="fc" id="qr-sup" onchange="ETIM.qrSupCambio()"></select></div>
        <div class="m-f2">
          <div class="fg"><label class="fl" id="qr-sec-lbl">Sector / fundo</label><select class="fc" id="qr-sector"></select></div>
          <div class="fg"><label class="fl">Tipo de personal *</label><select class="fc" id="qr-tipo"><option value="todos" selected>👥 Todo el personal (el trabajador elige)</option><option value="obrero">👷 Solo obreros (ruta)</option><option value="empleado">💼 Solo empleados (área)</option></select></div>
        </div>
        <button class="btn bpri" style="width:100%;padding:.85rem;" onclick="ETIM.qrCrear()">⚡ Generar QR</button>
        <button class="btn bout" style="width:100%;padding:.7rem;margin-top:.5rem" onclick="ETIM.qrPermTodos()">📌 Cargar QR de todos los supervisores y usuarios (crea los que faltan)</button>
        <div class="m-mut" style="margin-top:.6rem;font-size:.75rem;" id="qr-ayuda"><b>Permanente:</b> se imprime una vez y sirve siempre; cuando actualizas el banco, el mismo QR ya trae las preguntas nuevas. <b>Especial:</b> solo para una evaluación puntual en una fecha.</div>
      </section>
      <section class="m-card" id="qr-info" style="display:none"><h2 class="m-tit">📱 Mis QR asignados</h2><p class="m-sub">El administrador crea los QR y te los asigna. Tu <b>📌 QR permanente</b> se muestra abajo: imprímelo o muéstralo en pantalla completa. Si tienes un QR especial, elígelo en <b>Mis sesiones</b> y presiona <b>Mostrar QR</b> y muéstralo a los trabajadores de tu ruta: ellos indican si son obreros (sector, ruta y código) o empleados (área y sector/zona).</p></section>
      <section class="m-card" id="qr-activo"></section>
    </div>
    <section class="m-card" style="margin-top:1rem;"><h3 class="m-tit2">🗂 Mis sesiones</h3><div id="qr-lista"></div></section>
  </div>
  <div id="qr-full" class="m-full" onclick="if(event.target===this)ETIM.qrFull(false)"></div>`;
  document.body.appendChild(d);
}
function qrSvg(txt,cell){
  if(typeof qrcode!=='function') return `<div class="m-empty">No se pudo cargar el generador de QR. Revisa tu conexión.<br><small>${esc(txt)}</small></div>`;
  const q=qrcode(0,'M'); q.addData(txt); q.make();
  return q.createSvgTag({cellSize:cell||8,margin:2,scalable:true});
}
function puedeCrear(){return SESSION&&(SESSION.rol==='admin'||tiene('qrc'));}
function userDeSup(nom){const u=getUsuarios(true).find(x=>x.rol!=='admin'&&(x.nom===nom||_cumCoincide(x.nom,nom)));return u?u.user:'';}
function prepararFormQR(){
  const fc=puedeCrear(); $('qr-form').style.display=fc?'':'none'; $('qr-info').style.display=fc?'none':'';
  const sel=$('qr-sup'); if(!sel) return;
  const ms=miSup();
  const lista=SESSION.rol==='admin'?candidatosQR():[ms||{nom:SESSION.nom,sector:'',reemplazante:true}];
  sel.innerHTML=(SESSION.rol==='admin'?'<option value="">— Seleccionar —</option>':'')+lista.map(s=>`<option>${esc(s.nom)}</option>`).join('');
  sel.disabled=SESSION.rol!=='admin';
  if(!$('qr-fecha').value) $('qr-fecha').value=hoyL();
  QR.qrSupCambio();
}
function escucharSesiones(){
  if(unsubSes||!fbdb||!SESSION) return;
  const col=fbdb.collection(COL_SES), partes={a:[],b:[]};
  const err=e=>{console.error('QR sesiones:',e);const l=$('qr-lista');if(l)l.innerHTML='<div class="m-empty">No se pudo leer las sesiones: '+esc(e.message)+'</div>';};
  const unir=()=>{const m=new Map();[...partes.a,...partes.b].forEach(x=>m.set(x.id,x));
    sesiones=[...m.values()].sort((a,b)=>(b.ts||0)-(a.ts||0));
    if(sesActiva){const x=sesiones.find(v=>v.id===sesActiva.id);if(x)sesActiva=x;else{sesActiva=null;}}
    if(!sesActiva&&SESSION.rol!=='admin'){const ab=sesiones.find(x=>x.permanente&&abierta(x))||sesiones.find(abierta);if(ab){sesActiva=ab;escucharResp(ab.id);}}
    renderListaSes(); pintarActiva();};
  const map=s=>s.docs.map(d=>({id:d.id,...d.data()}));
  if(SESSION.rol==='admin'){const u1=col.orderBy('ts','desc').limit(80).onSnapshot(s=>{partes.a=map(s);unir();},err);
    const u2=col.where('permanente','==',true).onSnapshot(s=>{partes.b=map(s);unir();},err);unsubSes=()=>{u1();u2();};}
  else{const u1=col.where('usuario','==',SESSION.user).onSnapshot(s=>{partes.a=map(s);unir();},err);
    const u2=col.where('asignado','==',SESSION.user).onSnapshot(s=>{partes.b=map(s);unir();},err);
    unsubSes=()=>{u1();u2();};}
}
function nomSesion(s){return s.ruta?s.ruta:(s.sector?'Sector: '+s.sector:'Varios sectores');}
function renderListaSes(){
  const el=$('qr-lista'); if(!el) return;
  if(!sesiones.length){el.innerHTML='<div class="m-empty">Aún no tienes QR. '+(SESSION.rol==='admin'?'Genera el primero arriba.':'Pide al administrador tu QR permanente.')+'</div>';return;}
  const adm=SESSION.rol==='admin', perms=sesiones.filter(x=>x.permanente).sort((a,b)=>String(a.sup).localeCompare(String(b.sup))), esp=sesiones.filter(x=>!x.permanente);
  el.innerHTML=(perms.length?`<div class="m-lbl" style="margin-top:0">📌 QR permanentes</div><div class="m-tablewrap"><table class="m-table"><thead><tr>${adm?'<th>Supervisor</th>':''}<th>Empresa</th><th>Sector</th><th>Banco</th><th>Estado</th><th></th></tr></thead><tbody>
  ${perms.map(s=>{const ab=abierta(s);return `<tr>${adm?`<td><b>${esc(s.sup)}</b></td>`:''}<td>${esc(empTxt(s))}</td><td>${esc(s.sector||'Varios')}</td><td>v${s.bancoVersion||0}</td>
    <td><span class="m-est ${ab?'ab':'ce'}">${ab?'● Activo':'Pausado'}</span></td>
    <td style="white-space:nowrap"><button class="btn bpri bsm" onclick="ETIM.qrVer('${s.id}')">Mostrar QR</button>
      <button class="m-ico" title="Imprimir afiche" onclick="ETIM.qrAfiche('${s.id}')">🖨</button><button class="m-ico" title="Ver la evaluación (vista previa)" onclick="ETIM.qrPrevia('${s.id}')">👁</button>
      ${adm?`<button class="m-ico" title="Editar" onclick="ETIM.qrEditarSesion('${s.id}')">✏️</button><button class="m-ico" title="Eliminar" onclick="ETIM.qrEliminarSesion('${s.id}')">🗑</button>`:''}</td></tr>`;}).join('')}
  </tbody></table></div>`:'')+(esp.length?`<div class="m-lbl">📅 QR especiales (por fecha)</div>`:'');
  if(!esp.length) return;
  el.innerHTML+=`<div class="m-tablewrap"><table class="m-table"><thead><tr><th>Fecha</th><th>Empresa</th><th>Sector sugerido</th>${SESSION.rol==='admin'?'<th>Supervisor</th>':''}<th>Estado</th><th>Evaluados</th><th>Resultado</th><th></th></tr></thead><tbody>
  ${esp.slice(0,40).map(s=>{const ab=abierta(s);return `<tr>
    <td>${esc(fmtF(s.fecha))}</td><td>${esc(s.emp)}</td><td>${esc(s.sector||'Varios')}${s.ruta?` <span class="m-mut">${esc(s.ruta)}</span>`:''}</td>
    ${SESSION.rol==='admin'?`<td>${esc(s.sup)}</td>`:''}
    <td><span class="m-est ${ab?'ab':'ce'}">${ab?'● Abierta':(s.estado==='abierta'?'Vencida':'Cerrada')}</span></td>
    <td>${s.n!=null?s.n:'—'}</td>
    <td>${s.resultado!=null?`<b style="color:${s.resultado>=0.7?'var(--green)':'var(--red)'}">${pct(s.resultado)}</b>`:'—'}</td>
    <td style="white-space:nowrap">${ab?`<button class="btn bpri bsm" onclick="ETIM.qrVer('${s.id}')">Mostrar QR</button>`:`<button class="btn bout bsm" onclick="ETIM.qrVer('${s.id}')">Ver</button>`}
      ${SESSION.rol==='admin'?`<button class="m-ico" title="Editar sesión" onclick="ETIM.qrEditarSesion('${s.id}')">✏️</button><button class="m-ico" title="Eliminar sesión" onclick="ETIM.qrEliminarSesion('${s.id}')">🗑</button>`:''}</td></tr>`;}).join('')}
  </tbody></table></div>`;
}
/* con cientos de respuestas llegando a la vez, se repinta como máximo 2 veces por segundo */
let _pintT=null;
function pintarActiva(){clearTimeout(_pintT);_pintT=setTimeout(()=>{renderActiva();renderFull();},400);}
let diaPerm=hoyL();
function escucharResp(id){
  if(unsubResp){unsubResp();unsubResp=null;}
  respuestas=[];
  if(!fbdb||!id) return;
  const ss=sesiones.find(x=>x.id===id)||sesActiva;
  let q=fbdb.collection(COL_RESP).where('sesion','==',id);
  if(ss&&ss.permanente) q=q.where('fecha','==',diaPerm);   /* QR permanente: solo las respuestas del día elegido */
  unsubResp=q.onSnapshot(s=>{
    respuestas=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.ts||0)-(b.ts||0));
    pintarActiva();
  },e=>console.error('QR respuestas:',e));
}
function abierta(s){return s&&s.estado==='abierta'&&!(s.expira&&Date.now()>s.expira);}
function claveRuta(r){return [r.sector||'—',String(r.ruta||'—').toUpperCase(),String(r.cod||'').toUpperCase()].join('|');}
function gruposRuta(resps){
  const m=new Map();
  resps.forEach(r=>{const k=(r.tipo||'')+'#'+claveRuta(r);const g=m.get(k)||{tipo:r.tipo||'',sector:r.sector||'—',ruta:String(r.ruta||'—').toUpperCase(),cod:String(r.cod||'').toUpperCase(),n:0,s:0,apr:0};
    g.n++;g.s+=(r.resultado||0);if((r.resultado||0)>=0.7)g.apr++;m.set(k,g);});
  return [...m.values()].sort((a,b)=>a.sector.localeCompare(b.sector)||a.ruta.localeCompare(b.ruta,undefined,{numeric:true}));
}
function renderActiva(){
  const el=$('qr-activo'); if(!el) return;
  const s=sesActiva;
  if(!s){el.innerHTML=`<div class="m-qrvacio"><div style="font-size:3rem">📲</div><h3>Aún no hay un QR activo</h3><p>Genera una sesión o elige una de "Mis sesiones" para mostrar su código.</p></div>`;return;}
  const n=respuestas.length, prom=n?respuestas.reduce((a,r)=>a+(r.resultado||0),0)/n:0, apr=respuestas.filter(r=>(r.resultado||0)>=0.7).length;
  const ab=abierta(s), url=urlEval(s.id), gr=gruposRuta(respuestas), adm=SESSION.rol==='admin', pm=!!s.permanente;
  el.innerHTML=`
    <div class="m-qrtop"><div><div class="m-eyebrow">${pm?(ab?'<span class="m-live"></span> 📌 QR permanente activo':'📌 QR permanente pausado'):(ab?'<span class="m-live"></span> Sesión abierta':'Sesión '+(s.estado==='abierta'?'vencida':'cerrada'))}</div>
      <h2 class="m-tit" style="margin:.1rem 0">${pm?'Evaluación ETI vigente · banco v'+(s.bancoVersion||0):esc(nomSesion(s))}</h2>
      <div class="m-mut">${esc(empTxt(s))} · ${pm?'Sector: '+esc(s.sector||'el trabajador elige'):esc(fmtF(s.fecha))} · 👤 ${esc(s.sup)} · ${s.tipo==='obrero'?'👷 Solo obreros':s.tipo==='empleado'?'💼 Solo empleados':'👥 Todo el personal'} · 🔒 anónima</div></div>
      <div class="m-codigo" title="Código de sesión">${esc(s.id)}</div></div>
    ${ab?`<div class="m-qrbox">${qrSvg(url,8)}</div>
    <div class="m-link"><input class="fc" readonly value="${esc(url)}" onclick="this.select()"><button class="btn bout bsm" onclick="ETIM.qrCopiar()">📋 Copiar</button></div>`:''}
    ${pm?`<div class="m-link" style="align-items:center"><span class="m-mut" style="white-space:nowrap">📅 Respuestas del día</span><input class="fc" type="date" value="${esc(diaPerm)}" onchange="ETIM.qrDia(this.value)"></div>`:''}
    <div class="m-kpis3"><div><b>${n}</b><span>Evaluados${pm?' ('+esc(fmtF(diaPerm))+')':''}</span></div><div><b>${n?pct(prom):'—'}</b><span>Promedio</span></div><div><b>${gr.length}</b><span>Rutas / códigos</span></div></div>
    ${pm&&ab?`<div style="background:#FFF6E0;border:1px solid #F3D48A;border-radius:12px;padding:.6rem .9rem;margin:.2rem 0 .6rem;font-size:.82rem;color:#5B4300"><b>🤝 Si varios supervisores evalúan en un mismo sector:</b> la evaluación se registra a nombre del supervisor <b>programado</b> para ese sector y fecha (📅 Programación). Si no hay programación, queda a nombre del dueño del QR. Si apoyas en otro sector, usa el QR del supervisor programado.</div>`:''}
    <div class="m-acts" style="justify-content:center;margin:.8rem 0">
      ${pm?`${ab?`<button class="btn bout bsm" onclick="ETIM.qrFull(true)">⛶ Pantalla completa</button>`:''}
      <button class="btn bout bsm" onclick="ETIM.qrAfiche('${s.id}')">🖨 Imprimir afiche</button>
      <button class="btn bout bsm" onclick="ETIM.qrPrevia('${s.id}')">👁 Ver la evaluación</button>
      <button class="btn bout bsm" onclick="ETIM.cuestionarioPDF(false)" title="Descarga el cuestionario vigente en PDF (evidencia para auditoría)">📄 Cuestionario PDF</button>
      <button class="btn bpri bsm" onclick="ETIM.qrConsolidarDia()" title="Guarda el resultado del día en Registros y marca la programación">📊 Consolidar el día</button>`
      :ab?`<button class="btn bout bsm" onclick="ETIM.qrFull(true)">⛶ Pantalla completa</button>
      <button class="btn bpri bsm m-btnrojo" onclick="ETIM.qrCerrar()">⏹ Cerrar sesión y calcular</button>`
      :(s.estado==='abierta'?`<button class="btn bpri bsm" onclick="ETIM.qrCerrar()">⏹ Cerrar y calcular</button>`:'')}
    </div>
    <div class="m-resp">${n?`
      <div class="m-lbl" style="margin-top:0">Avance por sector, ruta y código · ${apr} aprobados (≥70%)</div>
      <table class="m-table"><thead><tr><th>Tipo</th><th>Sector</th><th>Ruta / Área</th><th>Código</th><th>Evaluados</th><th>Promedio</th>${adm?'<th></th>':''}</tr></thead><tbody>
      ${gr.map(g=>`<tr><td>${g.tipo==='empleado'?'💼 Empleado':'👷 Obrero'}</td><td>${esc(g.sector)}</td><td><b>${esc(g.ruta)}</b></td><td>${esc(g.cod||'—')}</td><td>${g.n}</td>
      <td><b style="color:${g.s/g.n>=0.7?'var(--green)':'var(--red)'}">${pct(g.s/g.n)}</b></td>
      ${adm?`<td style="white-space:nowrap"><button class="m-ico" title="Corregir sector, ruta o código de este grupo" onclick='ETIM.qrEditarGrupo(${JSON.stringify([g.sector,g.ruta,g.cod]).replace(/'/g,"&#39;")})'>✏️</button><button class="m-ico" title="Eliminar las respuestas de este grupo" onclick='ETIM.qrEliminarGrupo(${JSON.stringify([g.sector,g.ruta,g.cod]).replace(/'/g,"&#39;")})'>🗑</button></td>`:''}</tr>`).join('')}</tbody></table>
      <div class="m-lbl">Últimas respuestas</div>
      <table class="m-table"><thead><tr><th>Hora</th><th>Tipo</th><th>Sector</th><th>Ruta / Área</th><th>Código</th><th>Resultado</th>${adm?'<th></th>':''}</tr></thead><tbody>
      ${respuestas.slice(-25).reverse().map(r=>`<tr><td>${r.ts?new Date(r.ts).toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit'}):''}</td><td>${r.tipo==='empleado'?'💼':'👷'}</td><td>${esc(r.sector||'—')}</td><td>${esc(r.ruta||'—')}</td><td>${esc(r.cod||'—')}</td>
      <td><b style="color:${(r.resultado||0)>=0.7?'var(--green)':'var(--red)'}">${pct(r.resultado)}</b></td>
      ${adm?`<td style="white-space:nowrap"><button class="m-ico" title="Corregir" onclick="ETIM.qrEditarResp('${r.id}')">✏️</button><button class="m-ico" title="Eliminar" onclick="ETIM.qrEliminarResp('${r.id}')">🗑</button></td>`:''}</tr>`).join('')}</tbody></table>`
      :'<div class="m-empty">Esperando respuestas… aparecerán aquí automáticamente.</div>'}</div>`;
}
let fullOn=false;
function renderFull(){
  const el=$('qr-full'); if(!el) return;
  if(!fullOn||!sesActiva){el.classList.remove('on');return;}
  el.classList.add('on');
  el.innerHTML=`<div class="m-fullin"><button class="m-fullx" onclick="ETIM.qrFull(false)">✕</button>
    <div class="m-eyebrow" style="color:#C8102E">Evaluación de conocimiento ETI · anónima</div>
    <h2>Escanea con la cámara de tu celular</h2>
    <div class="m-fullqr">${qrSvg(urlEval(sesActiva.id),12)}</div>
    <div class="m-fullinfo"><b>${esc(empTxt(sesActiva))}</b> · ${esc(sesActiva.sup)} · Código <b>${esc(sesActiva.id)}</b></div>
    <div class="m-fullcount"><b>${respuestas.length}</b> trabajador(es) ya respondieron</div></div>`;
}
/* Consolida: 1 evaluación por sector, con 1 "ruta" por cada ruta+código */
function consolidar(s,resps){
  const porSector=new Map();
  const tipoDe=r=>r.tipo||(s.tipo==='empleado'?'empleado':'obrero');
  resps.forEach(r=>{const k=(r.sector||s.sector||'—')+'|'+tipoDe(r)+'|'+(r.emp||s.emp||'');if(!porSector.has(k))porSector.set(k,[]);porSector.get(k).push(r);});
  const secsDe=(lista)=> (s.banco||[]).map(sec=>{
    const subs=lista.map(r=>{const x=(r.secs||[]).find(y=>y.id===sec.id);return x?x.pts:0;});
    const promSec=subs.length?subs.reduce((a,b)=>a+b,0)/subs.length:0;
    const cum=sec.maxSec?promSec/sec.maxSec:0;
    return {id:sec.id,nom:sec.nom,peso:sec.peso,maxSec:sec.maxSec,promSec,cum,pond:cum*sec.peso,evSubs:subs};
  });
  return [...porSector.entries()].map(([kk,lista])=>{const [sector,tipo,emp]=kk.split('|');
    const rm=new Map();
    lista.forEach(r=>{const k=String(r.ruta||s.ruta||'—').toUpperCase()+'|'+String(r.cod||s.cod||'').toUpperCase();if(!rm.has(k))rm.set(k,[]);rm.get(k).push(r);});
    const rutas=[...rm.entries()].map(([k,l])=>{const [nom,cod]=k.split('|');const secs=secsDe(l);return {nom,cod,ne:l.length,tot:l.length,secs,resGrupo:secs.reduce((a,x)=>a+x.pond,0)};});
    const n=lista.length, resGen=rutas.reduce((a,r)=>a+r.resGrupo*r.ne,0)/n;
    return {emp:emp||s.emp,sup:s.sup,sector,tipo,fecha:s.fecha,destiempo:null,modalidad:'QR',sesionQR:s.id,rutas,resGen,n};
  });
}
/* _RECALIFICA_V1 (03-oct-2026): al cerrar, el panel vuelve a calificar cada respuesta con el
   banco de la sesión (respuestas correctas + % de cada pregunta). Lo que haya calculado el celular
   del trabajador no manda: si difiere, se corrige en Firebase y se reenvía a Azure. */
async function correctasSesion(s){
  const m={};
  for(const sec of (s.banco||[])) for(const p of (sec.pregs||[])){
    const c=[]; for(let i=0;i<(p.ops||[]).length;i++){ if((p.k||[]).includes(await sha(`${s.id}|${p.n}|${i}|${QR_SAL}`))) c.push(i); }
    m[p.n]=c;
  }
  return m;
}
function calificarResp(s,corr,resp){
  const ptsN={};
  const secs=(s.banco||[]).map(sec=>{let t=0;
    (sec.pregs||[]).forEach(p=>{const c=corr[p.n]||[], sel=((resp||{})[p.n]||[]).map(Number); let pts=0;
      if(p.tipo==='multiple'){const a=sel.filter(i=>c.includes(i)).length,b=sel.length-a;pts=c.length?Math.max(0,(a-b)/c.length)*p.max:0;}
      else pts=(sel.length===1&&c.includes(sel[0]))?p.max:0;
      pts=Math.round(pts*100)/100; ptsN[p.n]=pts; t+=pts;});
    return {id:sec.id,nom:sec.nom,peso:sec.peso,max:sec.maxSec,pts:Math.round(t*100)/100,pct:sec.maxSec?t/sec.maxSec:0};});
  const resultado=Math.round(secs.reduce((a,x)=>a+x.pct*x.peso,0)*10000)/10000;
  return {pts:ptsN,secs,resultado,estado:resultado>=0.7?'APROBADO':'REFUERZO'};
}
function editarForm(titulo,nota,v,sects,onOk){
  let m=$('ix-modal');if(!m){m=document.createElement('div');m.id='ix-modal';m.className='ix-modal';document.body.appendChild(m);}
  m.innerHTML=`<div class="ix-mbox"><h3>${titulo}</h3><p>${nota}</p>
    <label class="fl">Sector / fundo</label><select class="fc" id="eg-sec">${sects.map(x=>`<option ${x===v.sector?'selected':''}>${esc(x)}</option>`).join('')}</select>
    <label class="fl">Ruta</label><input class="fc" id="eg-ruta" value="${esc(v.ruta||'')}">
    <label class="fl">Código</label><input class="fc" id="eg-cod" value="${esc(v.cod||'')}">
    <div class="ix-macts"><button class="btn bout" id="eg-no">Cancelar</button><button class="btn bpri" id="eg-ok">Guardar cambios</button></div></div>`;
  m.classList.add('on'); $('eg-no').onclick=()=>m.classList.remove('on');
  $('eg-ok').onclick=()=>{const c={},s2=$('eg-sec').value,r2=$('eg-ruta').value.trim(),c2=$('eg-cod').value.trim();
    if(s2&&s2!==v.sector)c.sector=s2; if(r2&&r2.toUpperCase()!==String(v.ruta||'').toUpperCase())c.ruta=r2; if(c2.toUpperCase()!==String(v.cod||'').toUpperCase())c.codigo=c2;
    m.classList.remove('on'); if(!Object.keys(c).length){toast('No hay cambios','i');return;} onOk(c);};
}
const QR={
  abrirQR(){
    if(SESSION.rol!=='admin'&&!tiene('qr')){toast('🔒 No tienes acceso a la evaluación por QR','e');return;}
    crearPantallaQR(); go('sqr'); prepararFormQR(); escucharSesiones(); renderActiva(); renderListaSes();
  },
  qrSupCambio(){
    const nom=$('qr-sup').value, sd=SUPERVISORES.find(s=>s.nom===nom), sel=$('qr-sector');
    if(!sd){sel.innerHTML='<option value="">— Varios (el trabajador elige) —</option>'+SECTORES_TODOS.map(x=>`<option>${esc(x)}</option>`).join('');return;}
    let ops=SECTORES_TODOS;
    if(sd&&sd.multiSector) ops=sd.sectores; else if(sd&&sd.sector&&!sd.reemplazante) ops=[sd.sector];
    sel.innerHTML='<option value="">— Varios (el trabajador elige) —</option>'+ops.map(x=>`<option>${esc(x)}</option>`).join('');
    if(ops.length===1) sel.value=ops[0];
  },
  qrTipo(){},
  async qrCrear(){
    const v=id=>($(id).value||'').trim();
    const perm=v('qr-clase')!=='dia';
    const d={emp:v('qr-emp')==='*'?'':v('qr-emp'),sup:v('qr-sup'),sector:v('qr-sector'),tipo:v('qr-tipo'),fecha:perm?'':v('qr-fecha')};
    if(perm){return QR.qrCrearPerm(d);}
    if(!d.emp){toast('Para un QR especial elige la empresa','e');return;}
    const falta=[['emp','la empresa'],['sup','el supervisor'],['fecha','la fecha']].find(([k])=>!d[k]);
    if(falta){toast('Completa '+falta[1],'e');return;}
    if(!fbdb){toast('Sin conexión a la nube: no se puede crear el QR','e');return;}
    const btn=event&&event.target; if(btn){btn.disabled=true;btn.textContent='Generando…';}
    try{
      const id=idSesion(), [y,m,dd]=d.fecha.split('-').map(Number);
      const doc={...d,asignado:userDeSup(d.sup),ruta:'',cod:'',anonima:true,sectores:SECTORES_TODOS.slice(),areas:(typeof AREAS!=='undefined'?AREAS.slice():[]),id,estado:'abierta',usuario:SESSION.user,nomUsuario:SESSION.nom,
        creadoEn:new Date().toISOString(),ts:Date.now(),expira:new Date(y,m-1,dd,23,59,59).getTime(),banco:await bancoPublico(id),bancoVersion:(bancoMeta&&bancoMeta.version)||0};
      await fbdb.collection(COL_SES).doc(id).set(doc);
      sesActiva=doc; escucharResp(id); renderActiva(); toast(SESSION.rol==='admin'?'✅ QR generado y asignado a '+d.sup+'. Ya lo ve en su panel.':'✅ QR generado. Muéstralo a los trabajadores.','s');
    }catch(e){console.error(e);toast('No se pudo crear la sesión: '+e.message,'e');}
    finally{if(btn){btn.disabled=false;btn.textContent='⚡ Generar QR';}}
  },
  /* _QR_MANUAL_V1 (06-oct-2026): acceso directo a la evaluación manual existente desde la pantalla QR (no cambia el flujo manual) */
  qrManual(){
    if(SESSION.rol!=='admin'&&!tiene('eval')){toast('🔒 No tienes acceso a la evaluación manual. Pídelo al administrador.','e');return;}
    fullOn=false; renderFull();
    if(SESSION.rol==='admin'&&typeof iniciarComoAdmin==='function') iniciarComoAdmin(); else iniciar();
  },
  qrClase(){const p=$('qr-clase').value!=='dia';$('qr-fecha-g').style.display=p?'none':'';},
  async qrCrearPerm(d,silencio){
    if(!d.sup){toast('Elige el supervisor','e');return null;}
    if(usrOff(d.sup)){if(!silencio)toast(d.sup+' está desactivado o eliminado','e');return null;}
    if(!fbdb){toast('Sin conexión a la nube','e');return null;}
    const ya=await fbdb.collection(COL_SES).where('permanente','==',true).where('sup','==',d.sup).get();
    if(!ya.empty){const x={id:ya.docs[0].id,...ya.docs[0].data()};if(!silencio){sesActiva=x;escucharResp(x.id);renderActiva();toast('ℹ '+d.sup+' ya tiene su QR permanente (se muestra abajo). Para cambiarlo, edítalo en la lista.','i');}return null;}
    const id='P'+idSesion().slice(1);
    const doc={...d,tipo:d.tipo||'todos',fecha:'',permanente:true,asignado:userDeSup(d.sup),ruta:'',cod:'',anonima:true,sectores:SECTORES_TODOS.slice(),areas:(typeof AREAS!=='undefined'?AREAS.slice():[]),
      id,estado:'abierta',usuario:SESSION.user,nomUsuario:SESSION.nom,creadoEn:new Date().toISOString(),ts:Date.now(),expira:null,
      banco:await bancoPublico(id),bancoVersion:(bancoMeta&&bancoMeta.version)||0};
    await fbdb.collection(COL_SES).doc(id).set(doc);
    if(!silencio){sesActiva=doc;escucharResp(id);renderActiva();toast('✅ QR permanente creado para '+d.sup+'. Ya lo ve en su panel.','s');}
    return doc;
  },
  async qrPermTodos(){
    if(!fbdb){toast('Sin conexión a la nube','e');return;}
    window.etiSubirExtras();
    const emp=$('qr-emp').value==='*'?'':$('qr-emp').value;
    const q=await fbdb.collection(COL_SES).where('permanente','==',true).get();
    const perms=q.docs.map(d=>({id:d.id,ref:d.ref,...d.data()}));
    const tiene=nom=>perms.find(p=>p.sup===nom||_cumCoincide(p.sup,nom));
    const cand=candidatosQR(), falt=cand.filter(c=>!tiene(c.nom));
    /* QR ya creados que no tenían usuario vinculado (o lo tenían distinto): se vinculan */
    const vincular=perms.map(p=>({p,u:userDeSup(p.sup)})).filter(x=>x.u&&x.u!==x.p.asignado);
    let m=$('ix-modal');if(!m){m=document.createElement('div');m.id='ix-modal';m.className='ix-modal';document.body.appendChild(m);}
    m.innerHTML=`<div class="ix-mbox" style="max-width:560px"><h3>📌 Cargar QR permanentes de todos</h3>
      <p>Revisa la lista de <b>Gestión</b> y el módulo <b>Usuarios</b>. ${cand.length} supervisor(es) activos · ${cand.length-falt.length} ya tienen QR${vincular.length?` · ${vincular.length} QR se vincularán a su usuario`:''}.</p>
      ${falt.length?`<div style="max-height:320px;overflow:auto;border:1px solid #D9E0EC;border-radius:10px;padding:.4rem .6rem">
        <label style="display:flex;gap:.5rem;align-items:center;font-weight:800;padding:.3rem 0;border-bottom:1px solid #EEF1F6"><input type="checkbox" checked onchange="document.querySelectorAll('.qt-c').forEach(c=>c.checked=this.checked)"> Marcar todos (${falt.length} sin QR)</label>
        ${falt.map((c,i)=>`<label style="display:flex;gap:.5rem;align-items:center;padding:.3rem 0"><input type="checkbox" class="qt-c" data-i="${i}" checked>
          <span><b>${esc(c.nom)}</b> <span class="m-mut" style="font-size:.75rem">· ${esc(c.sector||'varios sectores')} · ${c.user?'usuario '+esc(c.user):'⚠ sin usuario (no podrá verlo en su panel)'} · ${c.fuente}</span></span></label>`).join('')}
      </div>`:'<div class="m-empty">✅ Todos los supervisores activos ya tienen su QR permanente.</div>'}
      <p class="m-mut" style="font-size:.75rem;margin-top:.5rem">Empresa de los nuevos QR: <b>${esc(emp||'el trabajador elige')}</b> (cámbiala arriba en el formulario si hace falta).</p>
      <div class="ix-macts"><button class="btn bout" id="qt-no">Cancelar</button><button class="btn bpri" id="qt-ok" ${!falt.length&&!vincular.length?'disabled':''}>Crear / actualizar</button></div></div>`;
    m.classList.add('on'); $('qt-no').onclick=()=>m.classList.remove('on');
    $('qt-ok').onclick=async()=>{
      const sel=[...document.querySelectorAll('.qt-c')].filter(c=>c.checked).map(c=>falt[+c.dataset.i]);
      m.classList.remove('on'); toast('⏳ Creando QR permanentes…','i');
      let c=0,v=0;
      for(const x of sel){try{if(await QR.qrCrearPerm({emp,sup:x.nom,sector:x.sector,tipo:'todos',fecha:''},true))c++;}catch(e){console.warn(x.nom,e);}}
      for(const {p,u} of vincular){try{await p.ref.update({asignado:u});v++;}catch(e){console.warn(p.sup,e);}}
      toast(`✅ ${c} QR nuevo(s)${v?` · ${v} vinculado(s) a su usuario`:''}. Ya aparecen en la lista y en el panel de cada supervisor.`,'s');
    };
  },
  qrDia(v){if(!v)return;diaPerm=v;if(sesActiva)escucharResp(sesActiva.id);renderActiva();},
  qrPrevia(id){window.open(urlEval(id)+'&vista=1','_blank');},
  qrAfiche(id){
    const s=sesiones.find(x=>x.id===id)||sesActiva; if(!s) return;
    const w=window.open('','_blank'); if(!w){toast('Permite las ventanas emergentes para imprimir','e');return;}
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>QR Evaluación ETI · ${esc(s.sup)}</title>
      <style>body{font-family:Arial,Helvetica,sans-serif;margin:0;color:#14213D}.p{width:180mm;margin:10mm auto;text-align:center;border:3px solid #003DA5;border-radius:18px;padding:12mm}
      h1{color:#003DA5;font-size:30px;margin:0 0 4px}h2{font-size:18px;color:#C8102E;margin:0 0 16px;font-weight:700}.q svg{width:120mm;height:120mm}
      ol{text-align:left;font-size:18px;line-height:1.7;margin:14px auto;max-width:140mm}.f{font-size:13px;color:#5B6B85;margin-top:10px}@media print{.p{margin:0 auto}}</style></head>
      <body><div class="p"><h1>Evaluación de Conocimiento ETI</h1><h2>Unifrutti · Gestión Humana · Es anónima</h2><div class="q">${qrSvg(urlEval(s.id),10)}</div>
      <ol><li>Abre la <b>cámara</b> de tu celular y apunta al código.</li><li>Toca el enlace que aparece.</li><li>Elige si eres <b>obrero</b> o <b>empleado</b> y responde con calma.</li></ol>
      <div class="f">${esc(empTxt(s))} · Supervisor: <b>${esc(s.sup)}</b> · Código ${esc(s.id)}</div></div><script>setTimeout(function(){print()},400)<\/script></body></html>`);
    w.document.close();
  },
  qrConsolidarDia(){
    const s=sesActiva; if(!s||!s.permanente) return; const fecha=diaPerm, key=s.id+'_'+fecha;
    confMod('¿Consolidar el día '+fmtF(fecha)+'?',`Se calculará el resultado de las respuestas de ese día (agrupado por empresa, sector, tipo, ruta/área y código) y se guardará en Registros. Si ya se consolidó antes, se reemplaza. Cada respuesta individual ya está en Azure e Indicadores.`,async()=>{
      try{
        const snap=await fbdb.collection(COL_RESP).where('sesion','==',s.id).where('fecha','==',fecha).get();
        const corr=await correctasSesion(s);
        const resps=snap.docs.map(d=>{const x=d.data();if(x.resp&&(x.bancoVersion||0)===(s.bancoVersion||0))Object.assign(x,calificarResp(s,corr,x.resp));return x;});
        if(!resps.length){toast('No hay respuestas ese día','i');return;}
        const prev=await fbdb.collection(COL_EVAL).where('sesionQR','==',key).get(); for(const d of prev.docs) await d.ref.delete();
        const lista=consolidar({...s,fecha,id:key},resps);
        lista.forEach(res=>guardarEvalNube(res));
        const resGen=lista.reduce((a,r)=>a+r.resGen*r.n,0)/resps.length;
        await fbdb.collection(COL_SES).doc(s.id).set({consol:{[fecha]:{n:resps.length,resultado:resGen,por:SESSION.user,en:new Date().toISOString()}}},{merge:true});
        try{const p=progPendienteDe(s.sup);if(p&&fechasPendientes(p).includes(fecha))marcarProgEjecutada(p.id,fecha);}catch(e){}
        const ver=lista.length===1?lista[0]:{...lista[0],sector:lista.map(r=>r.sector).join(', '),rutas:lista.flatMap(r=>r.rutas.map(x=>({...x,nom:r.sector+' · '+x.nom}))),resGen};
        try{localStorage.setItem('eti_last_res_'+(SESSION.user||'anon'),JSON.stringify(ver));}catch(e){}
        window._res=ver; renderRes(ver); go('sres');
        toast(`✅ Día consolidado · ${resps.length} evaluados · ${pct(resGen)}`,'s');
      }catch(e){console.error(e);toast('No se pudo consolidar: '+e.message,'e');}
    });
  },
  qrVer(id){const s=sesiones.find(x=>x.id===id);if(!s)return;sesActiva=s;escucharResp(id);renderActiva();$('qr-activo').scrollIntoView({behavior:'smooth',block:'start'});},
  qrEditarGrupo(arr){const [sector,ruta,cod]=arr;const sects=SECTORES_TODOS.includes(sector)?SECTORES_TODOS:[sector,...SECTORES_TODOS];
    editarForm('✏️ Corregir grupo',`Se corregirán las <b>${respuestas.filter(r=>claveRuta(r)===claveRuta({sector,ruta,cod})).length}</b> respuestas de <b>${esc(ruta)} ${esc(cod)}</b> (${esc(sector)}) en esta sesión.`,{sector,ruta,cod},sects,
      v=>window.etiAdminCambio({sesion_id:sesActiva.id,sector,ruta,codigo:cod||''},v,'Corrigiendo'));},
  qrEliminarGrupo(arr){const [sector,ruta,cod]=arr;
    confMod('¿Eliminar este grupo?',`Se eliminarán todas las respuestas de ${ruta} ${cod} (${sector}) de esta sesión, en Azure y Firebase. No se puede deshacer.`,
      ()=>window.etiAdminCambio({sesion_id:sesActiva.id,sector,ruta,codigo:cod||''},null,'Eliminando'));},
  qrEditarResp(id){const r=respuestas.find(x=>x.id===id);if(!r)return;const sects=SECTORES_TODOS.includes(r.sector)?SECTORES_TODOS:[r.sector,...SECTORES_TODOS];
    editarForm('✏️ Corregir respuesta','Corrige el sector, la ruta o el código de esta respuesta.',{sector:r.sector,ruta:r.ruta,cod:r.cod},sects,
      v=>window.etiAdminCambio({sesion_id:sesActiva.id,ids:[id]},v,'Corrigiendo'));},
  qrEliminarResp(id){confMod('¿Eliminar esta respuesta?','Se elimina en Azure y Firebase. No se puede deshacer.',()=>window.etiAdminCambio({sesion_id:sesActiva.id,ids:[id]},null,'Eliminando'));},
  qrEditarSesion(id){const s=sesiones.find(x=>x.id===id);if(!s)return;
    let m=$('ix-modal');if(!m){m=document.createElement('div');m.id='ix-modal';m.className='ix-modal';document.body.appendChild(m);}
    const sups=SUPERVISORES.filter(x=>x.rol!=='Administrador');
    m.innerHTML=`<div class="ix-mbox"><h3>✏️ Editar sesión ${esc(s.id)}</h3><p>Cambia a quién está asignada, el sector, la fecha o su estado.</p>
      <label class="fl">Asignada a</label><select class="fc" id="es-sup">${sups.map(x=>`<option ${x.nom===s.sup?'selected':''}>${esc(x.nom)}</option>`).join('')}</select>
      <label class="fl">Sector / fundo</label><select class="fc" id="es-sec"><option value="">— Varios (el trabajador elige) —</option>${SECTORES_TODOS.map(x=>`<option ${x===s.sector?'selected':''}>${esc(x)}</option>`).join('')}</select>
      <div style="${s.permanente?'display:none':''}"><label class="fl">Fecha</label><input class="fc" type="date" id="es-fec" value="${esc(s.fecha)}"></div>
      <label class="fl">Estado</label><select class="fc" id="es-est"><option value="abierta" ${s.estado==='abierta'?'selected':''}>${s.permanente?'Activo':'Abierta'}</option><option value="cerrada" ${s.estado!=='abierta'?'selected':''}>${s.permanente?'Pausado':'Cerrada'}</option></select>
      <div class="ix-macts"><button class="btn bout" id="es-no">Cancelar</button><button class="btn bpri" id="es-ok">Guardar</button></div></div>`;
    m.classList.add('on'); $('es-no').onclick=()=>m.classList.remove('on');
    $('es-ok').onclick=async()=>{const sup=$('es-sup').value,fecha=$('es-fec').value,[y,mo,dd]=fecha.split('-').map(Number);
      const u=s.permanente?{sup,asignado:userDeSup(sup),sector:$('es-sec').value,estado:$('es-est').value}
        :{sup,asignado:userDeSup(sup),sector:$('es-sec').value,fecha,estado:$('es-est').value,expira:new Date(y,mo-1,dd,23,59,59).getTime()};
      m.classList.remove('on');
      try{await fbdb.collection(COL_SES).doc(id).update(u);toast('✅ Sesión actualizada','s');}catch(e){toast('No se pudo guardar: '+e.message,'e');}};},
  qrEliminarSesion(id){const s=sesiones.find(x=>x.id===id);if(!s)return;
    confMod('¿Eliminar la sesión '+id+'?','Se eliminan la sesión, todas sus respuestas (Azure y Firebase) y su resultado consolidado en Registros. No se puede deshacer.',async()=>{
      try{await window.etiAdminCambio({sesion_id:id},null,'Eliminando sesión');
        const ev=await fbdb.collection(COL_EVAL).where('sesionQR','==',id).get(); for(const d of ev.docs) await d.ref.delete();
        await fbdb.collection(COL_SES).doc(id).delete();
        if(sesActiva&&sesActiva.id===id){sesActiva=null;escucharResp(null);}
        toast('🗑 Sesión eliminada','s');
      }catch(e){toast('No se pudo eliminar: '+e.message,'e');}});},
  qrCopiar(){const u=urlEval(sesActiva.id);(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>toast('Enlace copiado','s')).catch(()=>toast(u,'i'));},
  qrFull(on){fullOn=on;renderFull();if(on&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});else if(!on&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});},
  qrCerrar(){
    const s=sesActiva; if(!s) return;
    confMod('¿Cerrar la sesión QR?',`Ya no se aceptarán más respuestas. Se calculará el resultado de ${respuestas.length} trabajador(es), agrupado por sector, tipo (obrero/empleado), ruta o área y código, y se guardará en Registros.`,async()=>{
      try{
        const snap=await fbdb.collection(COL_RESP).where('sesion','==',s.id).get();
        const corr=await correctasSesion(s), fix=[];
        const resps=snap.docs.map(d=>{const x=d.data();
          if(x.resp&&(s.banco||[]).length&&(x.bancoVersion||0)===(s.bancoVersion||0)){const c=calificarResp(s,corr,x.resp);
            if(Math.abs((+x.resultado||0)-c.resultado)>0.00005||x.resultado==null) fix.push([d.ref,d.id,c]);
            Object.assign(x,c);}
          return x;});
        if(fix.length){
          await Promise.all(fix.map(([ref,,c])=>ref.update({...c,recalificado:new Date().toISOString()}).catch(e=>console.warn('recalificar',e))));
          try{window.etiAzureRespQR&&window.etiAzureRespQR(fix.map(([,id])=>[snap.docs.find(d=>d.id===id).data(),id]),fix.map(([,,c])=>c),fix.map(([ref])=>ref));}catch(e){}
        }
        const upd={estado:'cerrada',cerradaEn:new Date().toISOString(),cerradaPor:SESSION.user,n:resps.length};
        fullOn=false; renderFull();
        if(!resps.length){await fbdb.collection(COL_SES).doc(s.id).update(upd);toast('Sesión cerrada sin respuestas','i');return;}
        const lista=consolidar(s,resps);
        upd.resultado=lista.reduce((a,r)=>a+r.resGen*r.n,0)/resps.length;
        await fbdb.collection(COL_SES).doc(s.id).update(upd);
        lista.forEach(res=>guardarEvalNube(res));
        try{ if(window.etiAlertaRutas) window.etiAlertaRutas(lista); }catch(eAl){ console.warn('[_ETI_ALERTA_RUTA_V1]',eAl); }   /* _ETI_ALERTA_RUTA_V1 (20-oct) */
        try{const p=progPendienteDe(s.sup);if(p&&fechasPendientes(p).includes(s.fecha))marcarProgEjecutada(p.id,s.fecha);}catch(e){}
        const ver=lista.length===1?lista[0]:{...lista[0],sector:lista.map(r=>r.sector).join(', '),rutas:lista.flatMap(r=>r.rutas.map(x=>({...x,nom:r.sector+' · '+x.nom}))),resGen:upd.resultado};
        try{localStorage.setItem('eti_last_res_'+(SESSION.user||'anon'),JSON.stringify(ver));}catch(e){}
        window._res=ver; renderRes(ver); go('sres');
        toast(`✅ Sesión cerrada · ${resps.length} evaluados · ${pct(upd.resultado)}`,'s');
      }catch(e){console.error(e);toast('No se pudo cerrar: '+e.message,'e');}
    });
  }
};

/* ════════════════ ENGANCHES ════════════════ */
window.ETIM=Object.assign({},BK,AC,QR);

function inyectarAdmin(){
  const t1=$('atab1'); if(!t1) return;
  let bar=$('admin-tabs'); if(!bar){bar=t1.parentNode; bar.id='admin-tabs';}
  const enNav=t1.parentNode&&t1.parentNode.id==='es-nav';
  const lay=$('admin-cumplimiento').parentNode;
  if(!$('atab9')){
    const b=document.createElement('button');b.className='btn bout bsm';b.id='atab9';b.innerHTML='📱 Evaluación QR';b.onclick=()=>ETIM.abrirQR();(enNav?t1.parentNode:bar).appendChild(b);
  }
  if(esCreador()&&!$('atab10')){
    [['atab10','banco','🧩 Banco de Preguntas'],['atab11','accesos','🔐 Accesos']].forEach(([id,k,t])=>{
      const b=document.createElement('button');b.className='btn bout bsm m-tabcreador';b.id=id;b.innerHTML=t;b.onclick=()=>adminTab(k);(enNav?t1.parentNode:bar).appendChild(b);
      const p=document.createElement('div');p.id='admin-'+k;p.style.display='none';lay.insertBefore(p,$('admin-cumplimiento'));
    });
  }
  if(!esCreador()){['atab10','atab11','admin-banco','admin-accesos'].forEach(i=>{const e=$(i);if(e)e.remove();});}
  const lbl=(id,txt,antes)=>{if(enNav||$(id)||!$(antes))return;const d=document.createElement('div');d.id=id;d.className='m-navlbl';d.textContent=txt;bar.insertBefore(d,$(antes));};
  lbl('nav-lbl-qr','Evaluación en campo','atab9');
  lbl('nav-lbl-cr','Configuración · solo creador 🔒','atab10');
}
function inyectarMenu(){
  const g=document.querySelector('#sm .mgrid'); if(!g||g.querySelector('[onclick="ETIM.abrirQR()"]')) return;
  const c=document.createElement('div');c.className='mc';c.setAttribute('onclick','ETIM.abrirQR()');
  c.innerHTML='<span class="mci">📱</span><div class="mct">Evaluación por QR</div><div class="mcd">El trabajador responde desde su celular</div>';
  g.insertBefore(c,g.children[1]||null);
}
const _adminTab=window.adminTab;
window.adminTab=function(tab){
  ['admin-banco','admin-accesos'].forEach(i=>{const e=$(i);if(e)e.style.display='none';});
  _adminTab(tab);
  [['atab10','banco'],['atab11','accesos']].forEach(([id,k])=>{const b=$(id);if(b)b.className=(tab===k?'btn bpri bsm':'btn bout bsm')+' m-tabcreador';});
  if(tab==='banco'||tab==='accesos'){const gd=$('gDock');if(gd)gd.classList.add('min');}
  if(tab==='banco'){renderBanco();}
  if(tab==='accesos'){accDraft=null;renderAccesos();}
};
['iniciar','irDash','verUlt'].forEach((fn,i)=>{
  const k=['eval','dash','ult'][i], orig=window[fn]; if(typeof orig!=='function') return;
  window[fn]=function(){if(!tiene(k)){toast('🔒 No tienes acceso a este módulo','e');return;}return orig.apply(this,arguments);};
});
const _renderRes=window.renderRes;
if(typeof _renderRes==='function') window.renderRes=function(res){const r=_renderRes.apply(this,arguments);
  const ed=document.querySelector('#sres button[onclick="go(\'sp3\')"]');if(ed)ed.style.display=(res&&res.modalidad==='QR')?'none':'';return r;};
const _go=window.go;
window.go=function(id){
  if(id!=='sqr'&&fullOn){fullOn=false;renderFull();}
  if(window._bancoPend&&!['sp2','sp3','sres'].includes(id)){aplicarBanco(window._bancoPend);window._bancoPend=null;}
  const r=_go.apply(this,arguments);
  if(id==='sadmin'){inyectarAdmin();if(window.innerWidth>=1100)setTimeout(()=>{const gd=$('gDock');if(gd)gd.classList.add('min');},60);}
  if(id==='sm'){inyectarMenu();aplicarAccesosMenu();}
  return r;
};
window.addEventListener('beforeunload',e=>{if(draftSucio){e.preventDefault();e.returnValue='';}});

// Nube: banco y accesos en vivo
if(fbdb){
  fbdb.collection(COL_CFG).doc(DOC_BANCO).onSnapshot(d=>{
    const x=d.exists?d.data():null;
    let valido=false; try{valido=!!(x&&Array.isArray(x.secs)&&x.secs.length&&!validarBanco(x.secs).length);}catch(e){console.warn('Banco en la nube con formato inválido; se mantiene el actual',e);}   /* _BANCO_SEGURO_V1 */
    if(valido){
      BANCO=x.secs; bancoMeta={version:x.version,por:x.por,en:x.en};
      /* _BANCO_DIFERIDO_V1: si hay una evaluación manual en curso, no se le cambian las preguntas a mitad */
      const act=document.querySelector('.screen.active'), enCurso=act&&['sp2','sp3','sres'].includes(act.id);
      if(enCurso&&SECS.length){window._bancoPend=BANCO;toast('ℹ El banco de preguntas se actualizó; se aplicará al terminar esta evaluación.','i');}
      else{window._bancoPend=null;aplicarBanco(BANCO);}
      if(!draftSucio){draft=null; const p=$('admin-banco'); if(p&&p.style.display!=='none') renderBanco();}
    }
  },e=>console.warn('Banco nube:',e));
  fbdb.collection(COL_CFG).doc(DOC_ACC).onSnapshot(d=>{
    ACC=(d.exists&&d.data())||{usuarios:{}}; ACC.usuarios=ACC.usuarios||{};
    aplicarAccesosMenu();
    window.etiSubirExtras();
    try{const ul=document.getElementById('admin-users');if(ul&&ul.style.display!=='none'&&typeof renderAdminUsers==='function')renderAdminUsers();}catch(e){}
  },e=>console.warn('Accesos nube:',e));
}
function arranque(){
  inyectarMenu();
  document.querySelectorAll('.n-pregs').forEach(e=>e.textContent=nPregs());
  const act=document.querySelector('.screen.active');
  if(act&&act.id==='sadmin'){inyectarAdmin();if(window.innerWidth>=1100)setTimeout(()=>{const gd=$('gDock');if(gd)gd.classList.add('min');},600);}
  if(act&&act.id==='sm') aplicarAccesosMenu();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',arranque); else arranque();
console.log('[_MODULOS_V1] listo');
})();
