const fs = require('fs');

let c = fs.readFileSync('c:/Users/8ange/AppData/Roaming/Code/User/workspaceStorage/ebe846d206d16109f702cc509ff79c04/GitHub.copilot-chat/chat-session-resources/e54a3e3e-fed9-43ac-b0d0-ef0a39b56c7d/call_MHxsSlk4Sm5lUkd1eU92Vmo5TzA__vscode-1776036202810/content.txt', 'utf-8');

c = c.replace(/const \[user, setUser\] = useState\(null\);\s*const \[reservas, setReservas\] = useState\(\[\]\);/g, 
  'const [user, setUser] = useState(null);\n  const [reservas, setReservas] = useState([]);\n  const [bloquesLibres, setBloquesLibres] = useState([]);'
);

c = c.replace(
  /const combinedData = \[\.\.\.\(Array\.isArray\(proximas\)\? proximas : \[\]\), \.\.\.\(Array\.isArray\(pendientes\)\? pendientes : \[\]\)\];/g,
  'const combinedData = [...(Array.isArray(proximas)? proximas : []), ...(Array.isArray(pendientes)? pendientes : [])];\n' +
  '        try {\n' +
  '          const tb = await apiClient.get("/api/bloques/tutor/" + correoTutor);\n' +
  '          if (tb.data && !!tb.data.length) {\n' +
  '             const libres = tb.data.filter(b => b.estado === "LIBRE" || b.estado === "DISPONIBLE").map(b => {\n' +
  '                 let dInicio = parseUtcDate(b.fecha_inicio || b.horaInicio);\n' +
  '                 let dFin = parseUtcDate(b.fecha_fin || b.horaFin);\n' +
  '                 return {\n' +
  '                    id: "b_" + (b.bloque_id || b.id),\n' +
  '                    isLibre: true,\n' +
  '                    materiaNombre: b.materia_nombre || (typeof materiasDict !== "undefined" ? materiasDict[b.materiaId] : "Tutor\u00EDa") || "Tutor\u00EDa",\n' +
  '                    title: "Libre - " + (b.materia_nombre || (typeof materiasDict !== "undefined" ? materiasDict[b.materiaId] : "Tutor\u00EDa") || "Tutor\u00EDa"),\n' +
  '                    start: dInicio,\n' +
  '                    end: dFin,\n' +
  '                    horario: dInicio.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}) + " - " + dFin.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})\n' +
  '                 };\n' +
  '             });\n' +
  '             setBloquesLibres(libres);\n' +
  '          }\n' +
  '        } catch(e) { console.error("Error fetching blocks", e); }'
);

c = c.replace(/\{reservasActivas\.length === 0 \? \(/g, '{reservasActivas.length === 0 && viewMode === "list" ? (');

c = c.replace(/<Calendar[\s\S]*?messages=\{\{/g, 
  '<Calendar\n' +
  '                localizer={localizer}\n' +
  '                events={[...reservasActivas, ...bloquesLibres]}\n' +
  '                startAccessor="start"\n' +
  '                endAccessor="end"\n' +
  '                style={{ height: "100%" }}\n' +
  '                min={new Date(0, 0, 0, 7, 0, 0)}\n' +
  '                max={new Date(0, 0, 0, 18, 0, 0)}\n' +
  '                date={calendarDate}\n' +
  '                onNavigate={(newDate) => setCalendarDate(newDate)}\n' +
  '                defaultView="week"\n' +
  '                eventPropGetter={(event) => {\n' +
  '                  if (event.isLibre) return { className: "free-event", style: { backgroundColor: "#28a745", borderColor: "#1e7e34", color: "#fff", fontSize:"0.9rem", cursor:"pointer" } };\n' +
  '                  if (event.isRemoving) return { className: "removing-event" };\n' +
  '                  return { className: "active-event" };\n' +
  '                }}\n' +
  '                onSelectEvent={(event) => {\n' +
  '                  if(event.isLibre) {\n' +
  '                     Swal.fire({ title: "Hora Disponible", html: "<p><strong>Materia:</strong> "+event.materiaNombre+"</p><p><strong>Horario:</strong> "+event.horario+"</p><p>Los estudiantes podrán agendar tutorías en esta franja.</p>", icon: "success" });\n' +
  '                     return;\n' +
  '                  }\n' +
  '                  Swal.fire({\n' +
  '                    title: "Clase con " + event.estudianteNombre,\n' +
  '                    html: "<p><strong>Materia:</strong> "+event.materiaNombre+"</p><p><strong>Horario:</strong> "+event.horario+"</p><p>Califícala en la vista de tarjetas.</p>",\n' +
  '                    icon: "info"\n' +
  '                  });\n' +
  '                }}\n' +
  '                messages={{'
);

c = c.replace(/\u00f0\u0178\u017D\u201C/g, '\uD83C\uDF93'); 
c = c.replace(/Tutor\u00C3\u00ADa/g, 'Tutor\u00EDa'); 
c = c.replace(/Tutor\u00C3a/g, 'Tutor\u00EDa'); 
c = c.replace(/Sesi\u00C3\u00B3n/g, 'Sesi\u00F3n');
c = c.replace(/Cerrar Sesi\u00C3\u00B3n/g, 'Cerrar Sesi\u00F3n');
c = c.replace(/cat\u00C3\u00A1logo/g, 'cat\u00E1logo');
c = c.replace(/pr\u00C3\u00B3ximas/g, 'pr\u00F3ximas');
c = c.replace(/fall\u00C3\u00B3/g, 'fall\u00F3');
c = c.replace(/Tambi\u00C3\u00A9n/g, 'Tambi\u00E9n');
c = c.replace(/env\u00C3\u00ADa/g, 'env\u00EDa');
c = c.replace(/env\u00C3a/g, 'env\u00EDa');
c = c.replace(/\u00C2\u00BFMarcar/g, '\u00BFMarcar');
c = c.replace(/\u00C2\u00BFReportar/g, '\u00BFReportar');
c = c.replace(/Reportar\u00C3\u00A1s/g, 'Reportar\u00E1s');
c = c.replace(/S\u00C3\u00AD,/g, 'S\u00ED,');
c = c.replace(/S\u00C3,/g, 'S\u00ED,');
c = c.replace(/guard\u00C3\u00B3/g, 'guard\u00F3');
c = c.replace(/present\u00C3\u00B3/g, 'present\u00F3');
c = c.replace(/\u00E2\u0153\u201D\u00EF\u00B8\u008F/g, '\u2714\uFE0F');
c = c.replace(/\u00E2\u0153\u201D\u00EF\u00B8/g, '\u2714\uFE0F');
c = c.replace(/\u00E2\u009D\u0152/g, '\u274C');
c = c.replace(/Atr\u00C3\u00A1s/g, 'Atr\u00E1s');
c = c.replace(/D\u00C3\u00ADa/g, 'D\u00EDa');
c = c.replace(/D\u00C3a/g, 'D\u00EDa');
c = c.replace(/interact\u00C3\u00BAa/g, 'interact\u00FAa');
c = c.replace(/\u00E2\u0153\u201D\u00EF\u00B8\u008F/g, '\u2714\uFE0F');
c = c.replace(/\u00F0\u0178\u017D\u2030/g, '\uD83C\uDF89'); 
c = c.replace(/\u00F0\u0178\u201C\u2026/g, '\uD83D\uDCC5'); 
c = c.replace(/\u00F0\u0178\u201C\u009D/g, '\uD83D\uDCDD'); 
c = c.replace(/\u00C3\u00AD/g, '\u00ED'); 
c = c.replace(/\u00C3\u00B3/g, '\u00F3');
c = c.replace(/\u00C3\u00A1/g, '\u00E1');
c = c.replace(/Tarjetas \u00F0\u0178\u201C/g, 'Tarjetas \uD83D\uDCDD');

fs.writeFileSync('c:/Software2C/Tutorias/Tutorias/frontend-tutorias/src/pages/PanelTutor.jsx', c, 'utf-8');
console.log('Restored, fixed dates, fixed encoding!');
