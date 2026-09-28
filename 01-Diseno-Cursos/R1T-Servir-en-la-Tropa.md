# R1-tropa · Servir en la Tropa

> Diseño del curso (27-09-2026, ADR-095). JSON: `05-Generador-Cursos/borradores/servir-en-tropa.json`. Spec §3 (molde común de los R1-rama). Construido con las lecciones de las auditorías de la E1 y la E2.

## Ficha

| Campo | Valor |
|---|---|
| `courseId` | `servir-en-tropa` |
| Ruta / nivel | Ruta 1 · Nivel 1 · **rama Tropa** (`route: grupo`, `level: 1`, `branch: tropa`) |
| Público | Rovers de 18 a 20 años que van a servir en la Tropa de su Grupo |
| Duración | ~35 min: bienvenida y 5 lecciones |
| Fuentes | ***Guía de Dirigente de Tropa*** (ASC 2026, 68 pp.) y ***Guía de Buenas Prácticas para Jefes de Tropa*** (25-oct-2023, 32 pp., documento de apoyo en revisión; ADR-057). La Guía 2026 mantiene las especialidades (p. 18) pero no describe cómo se crean. Se citan **las páginas del PDF**. Complementos: *Modelo de Aplicación* (proporción, p. 22) y *Política A Salvo del Peligro* (estrategia 2+1, p. 26). |
| Recomendado antes | S1 y R1 |

## Gancho

> **«El dirigente es un formador de líderes, no un sustituto de ellos.»**

Es cita de la Guía de Tropa, p. 28, y vale todavía más para el Rover. La tentación del Rover en la Tropa es otra: tiene casi la edad de un hermano mayor, los scouts lo admiran, y es fácil que termine haciendo de guía de patrulla. Aparece en la bienvenida, en la lección 3 y en el cierre.

## Objetivos

1. **Describir** cómo son los y las scouts de 11 a 14 años, incluida su vida digital.
2. **Distinguir** el papel del guía de patrulla, del Jefe de Tropa y del Rover que apoya.
3. **Decidir** cómo participar en la Aventura y en las ceremonias de la patrulla sin apropiarte de ellas.
4. **Ofrecer** lo que sabes hacer como asesoría, sin hacer el trabajo por el scout (por ejemplo, en una especialidad).
5. **Aplicar** la estrategia 2+1, con atención especial a la cercanía de edad y a los canales digitales.

## Decisiones de diseño

- **La cercanía de edad es el riesgo propio de esta rama.** Entre un Rover de 18 y un scout de 14 hay cuatro años. La Guía describe a los scouts cuestionando la autoridad adulta (p. 15) y viviendo en redes (p. 15). El curso trabaja la frontera sin alarmismo: la estrategia 2+1 vale para todos (Política ASP, p. 26), también en lo digital.
- **«Sinodal» con su sentido correcto.** La *Guía de Buenas Prácticas* dice que el scout que crea una especialidad debe «conseguir un sinodal que conozca el tema y pueda asesorar en el proceso» (p. 28). Es el único lugar de la ruta donde un Rover puede ser sinodal: **como experto en un tema, no como cargo**, y a solicitud del scout. Así lo registra el GLOSARIO v1.34 (fila «Sinodal»). Se redacta evitando los patrones de `lexico.json`, que prohíben «sinodal» como cargo del Rover.
- **El Jefe de Tropa como «custodio del sistema de equipos»** (p. 29). La Guía de Tropa no trae reglas propias de baño ni de contacto. Su capítulo 13 (p. 66) es general, así que el curso aplica la 2+1 y la gestión del riesgo, y no inventa reglas.

## Lecciones

### 1 · Bienvenida (intro)
El gancho. La Tropa reúne a scouts de 11 a 14 años, organizados en patrullas.

### 2 · Cómo son de 11 a 14 años (~6 min)
- **Anclaje:** hace pocos años tú estabas ahí.
- **Fuentes (p. 14–16):**
  - el cuerpo que cambia, y lo que puede herir un comentario;
  - la mente que cuestiona («no darles todas las respuestas»);
  - un corazón intenso («escuchen más que juzguen»);
  - la patrulla como su mundo, y el cuestionamiento de la autoridad adulta;
  - la vida digital, con sus oportunidades y riesgos (ciberacoso, pérdida de privacidad);
  - lo que dicen esperar: que los escuchen, que lo que aprenden tenga sentido y confianza en los adultos;
  - «Escucha más, habla menos» (p. 16).
- **Reflexión:** algo que un adulto te dijo a esa edad y todavía recuerdas, para bien o para mal. Sin nombres.
- **Quiz (2):** un comentario sobre el cuerpo de un scout, y un scout que cuestiona una norma.

### 3 · La patrulla es de ellos (~7 min)
- **Fuentes:**
  - el Sistema de Patrullas como «columna vertebral de la tropa» (p. 27);
  - patrullas de 6 a 8 scouts, con nombre, banderín, lema y tradiciones (p. 27);
  - el **guía de patrulla es elegido por sus compañeros, no por el dirigente**, y hay cargos (p. 27);
  - «El dirigente es un formador de líderes, no un sustituto de ellos» (p. 28);
  - el Consejo de Patrulla y la Corte de Honor, que es de guías y dirigentes (p. 28);
  - el Jefe de Tropa como custodio (p. 29).
- **Para el Rover:** no reemplazar al guía, no sentarse en la Corte de Honor sin que lo inviten y no «arreglar» la patrulla desde afuera.
- **Reflexión:** una vez en tu Clan en que alguien hizo por ti algo que querías hacer tú.
- **Quiz (2):** la patrulla que pide al Rover que sea su guía, y la patrulla Halcones que se queda sin guía con el dirigente de viaje (al guía lo eligen ellos).

### 4 · La Aventura y lo que sabes hacer (~7 min)
- **Fuentes:**
  - el marco simbólico es **la Aventura**: una caminata se vuelve expedición y un juego, misión (p. 30);
  - las tres dinámicas: explorar, apropiarse de un territorio, pertenecer a la patrulla (p. 30);
  - las historias y tradiciones de patrulla que el dirigente cuida (p. 31);
  - la **Promesa al Guía**, ceremonia propia de la Tropa (p. 32);
  - «el dirigente no impone las ceremonias: las facilita» (p. 32).
- **Lo que sabes hacer:** si un scout crea una especialidad y tú sabes del tema, puede pedirte que lo asesores. La *Guía de Buenas Prácticas* llama **sinodal** a esa persona (p. 28): un experto que asesora, no un cargo, siempre con el conocimiento del dirigente.
- **Reflexión:** algo que sabes hacer bien (técnica, arte, oficio) y cómo lo compartirías sin hacerlo tú por el scout.
- **Quiz (2):** un scout que te pide que le diseñes la insignia de su especialidad (un distractor codifica el uso anterior de «sinodal» como función del Rover), y la Promesa al Guía.
- **Anclaje e info-box de la Aventura:** la salida que más recuerdas; entrar en la Aventura sin narrarla desde afuera. El info-box del sinodal nombra el uso anterior de la palabra y dice «asesorarlo», no «acompañar» (glosario, «Rover en servicio»).

### 5 · Cercanía sin confusión (~6 min)
- **Anclaje:** los scouts te siguen en redes y te escriben como a un amigo.
- **Fuentes:**
  - la estrategia 2+1, que vale para todos, también en comunicaciones, y pide cuidar el contacto digital y las imágenes (Política ASP, p. 26);
  - la vida digital y el ciberacoso (Guía de Tropa, p. 15);
  - «que se cuide su salud mental y haya confianza en los adultos que los acompañan» (p. 16).
- **Para el Rover:** ser cercano sin ser su par. No aceptar solicitudes de amistad o de seguimiento para conversar por privado, no compartir su contenido y derivar al dirigente.
- **Qué significa para ti:** tres gestos concretos: lo del día a día va a un canal con el dirigente; a seguirte en redes, no con cariño; lo difícil por chat se contesta una sola vez, sin moverlo a otro chat ni seguir a solas, y se avisa esa noche. En la 2+1 no cuentas como adulto.
- **Reflexión:** un scout de 14 años que te pide seguirte en tus redes: cómo decirle que no y qué canal ofrecerle.
- **Quiz (2):** un scout que te cuenta por chat que lo molestan en el colegio (distractores: llevarlo al chat de la patrulla; seguir a solas guardando pantallazos), y una foto del campamento en tus redes personales.

### 6 · Tu apoyo, paso a paso (~6 min)
- **Fuentes:**
  - la gestión del riesgo en seis elementos (Guía de Tropa, p. 66);
  - la proporción: un adulto por patrulla más el Jefe de Unidad, y el Rover no cuenta (*Modelo*, p. 22).
- **Caso completo:** una excursión de patrulla, de principio a fin.
- **Compromiso:** *«En la Tropa voy a ___, y nunca voy a ___».*
- **Quiz (3):** evalúa la gestión del riesgo, no repite R1: la patrulla que quiere ir sola «porque va el Rover»; la quebrada crecida que ves el día antes (identificar y contarlo antes de salir); un scout con fiebre a las once de la noche (el Rover no completa la 2+1 con otro Rover).

## Logros
1. Recuerdo de Tropa · 2. Formador, no Sustituto · 3. Espíritu de Aventura · 4. Cercano con Límites · 5. Listo para la Expedición.
