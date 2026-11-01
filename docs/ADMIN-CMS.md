# Administrar el sitio con Pages CMS

Esta guía es para cargar y editar el contenido del sitio de Tommy Petersen /
In The Loop **sin tocar código**, desde [pagescms.org](https://pagescms.org).

El sitio no tiene usuarios ni contraseñas propias: el acceso es tu cuenta de
**GitHub**. Cada vez que guardás algo en Pages CMS, se crea un commit en el
repositorio; GitHub Actions valida el contenido, compila el sitio y (solo en
la rama `main`) lo publica en GitHub Pages.

> **Contenido administrable desde el CMS:** shows, galerías por ciudad,
> tracks y datos del sitio. Los videos todavía no están en el CMS. La imagen
> hero de la portada del sitio tampoco se gestiona desde Pages CMS; §5 resume
> su reemplazo manual.

---

## 1) Entrar y elegir el proyecto

1. Entrá a [pagescms.org](https://pagescms.org) e iniciá sesión con GitHub.
2. Autorizá el acceso al repositorio **`facuscholze/intheloop`** (se pedirá
   la primera vez).
3. Elegí la rama de trabajo:
   - **Producción:** `main`. Todo lo que guardes ahí se publica en el sitio.
   - **Prueba:** la rama que te indique desarrollo. Sirve para practicar: lo
     que guardes ahí **no** se publica hasta que se fusione a `main`.

> Importante: Pages CMS lee la configuración del archivo `.pages.yml` que
> esté **en la rama elegida**. Si entrás y no ves las colecciones de abajo,
> probablemente estás en una rama sin ese archivo.

En el menú vas a ver:

| Sección | Para qué sirve |
|---|---|
| **Shows** | Crear y editar los datos y la foto principal de cada show. |
| **Galerías por ciudad** | Datos y portada de cada ciudad. |
| **Tracks** | Crear y editar tracks/sets, su audio, su portada y sus links externos. |
| **Sitio** | Artista, agencia, frase principal, contacto y géneros. |
| **Media → Fotos de shows** | Carpetas individuales de los shows. El flujo normal es cargar la foto en la ficha del show; Media sirve para revisar o limpiar archivos. |
| **Media → Fotos de galería** | Subir el lote de fotos de cada ciudad dentro de su carpeta. La portada se carga o elige desde la ficha de la ciudad. |
| **Media → Audio y portadas de tracks** | Carpetas individuales de los tracks. El flujo normal es cargar el audio y la portada en la ficha del track; Media sirve para revisar o limpiar archivos. |

### Regla clave: cada archivo en la carpeta de su ítem

Las fotos y audios **no van a una carpeta común**:

- la foto de un show queda en `content/shows/<carpeta-del-show>/`;
- las fotos y la portada de una ciudad quedan en
  `content/gallery/<carpeta-de-la-ciudad>/`;
- el audio y la portada de un track quedan en
  `content/songs/<carpeta-del-track>/`.

Podés completar **Foto principal**, **Portada** y **Archivo de audio**
mientras creás la ficha. Pages CMS sube el archivo apenas lo elegís; si la
carpeta del ítem todavía no existe, puede caer transitoriamente en la raíz de
la media (`content/shows/`, `content/gallery/` o `content/songs/`).

Al tocar **Guardar**, el JSON de la ficha ya queda referenciando ese archivo.
GitHub Actions corre entonces **Ubicar media del CMS en su carpeta**, lo mueve
físicamente a la carpeta del ítem, corrige la referencia y crea un commit
automático (`Mueve media del CMS a la carpeta de su ítem`). Después relanza la
validación y, en `main`, el deploy. **Esperá a que aparezca ese commit y
terminen las acciones antes de volver a editar o borrar ese archivo.**

Si el ítem ya existe, también podés usar **Select** y subir/elegir el archivo
con su carpeta abierta; así no hace falta la reubicación. Si en cambio usás
**Upload** directo o arrastrás el archivo sobre el campo, puede caer en la
raíz, pero al guardar la ficha la misma automatización lo reubica.

Los shows y tracks nuevos nacen **publicados** (la casilla **Borrador** viene
apagada). En producción puede haber una versión provisoria durante unos
minutos, hasta que termina la reubicación y el deploy corregido. Si no querés
que se vea esa etapa intermedia, activá **Borrador** antes de guardar y
desactivalo cuando las acciones hayan terminado.

> La subida de un archivo crea el archivo en GitHub apenas termina, incluso
> antes de guardar la ficha. Si subís algo y salís sin guardar, puede quedar
> huérfano en la raíz o en una carpeta. La automatización **no** mueve ni
> borra archivos que ningún JSON referencia, porque no puede saber a qué
> ítem pertenecen; completá la ficha o avisá a desarrollo para limpiarlo.

La carpeta se crea al guardar con los datos originales (fecha + venue del
show, ciudad de la galería o título del track); cambiar esos datos después
**no renombra** la carpeta. Podés confirmar el nombre entrando a la Media
correspondiente y mirando la lista de carpetas. Esto solo importa si usás
**Select** dentro de la carpeta de un ítem ya existente.

---

## 2) Cargar un show nuevo

1. Entrá a **Shows** y creá la entrada con el botón de nuevo ítem **desde la
   raíz de la colección** (no desde el menú contextual de otro show, así la
   carpeta se crea en el lugar correcto).
2. Completá los datos:
   - **Venue / evento** *(obligatorio)*: el nombre tal como debe verse.
   - **Fecha** *(obligatoria)*: con el selector de fecha; se guarda como
     `AAAA-MM-DD`.
   - **Ciudad**: completarla siempre (se usa en el listado y en las
     estadísticas por país).
   - **País** *(obligatorio)*: escribí parte del nombre para buscarlo
     (ej. "Argen…"). Se guarda el código ISO (`AR`, `FR`, `JP`…) y el sitio
     calcula solo el nombre, la bandera y los contadores — un país nuevo no
     requiere ningún cambio de código.
   - **Instagram** y **Link a la galería**: opcionales; si cargás algo, que
     sea la URL completa (`https://…`).
   - **Destacado**: resalta el show en el sitio.
   - **Borrador**: viene apagado, así que el show queda publicado al guardar.
     Activalo solo si querés prepararlo u ocultarlo sin borrarlo.
   - **Foto principal**: subí o elegí una sola foto y verificá que el campo
     muestre la miniatura correcta.
3. Tocá **Guardar**.
4. Si Pages CMS dejó la foto en la raíz de **Fotos de shows**, esperá el
   commit automático **Mueve media del CMS a la carpeta de su ítem** y a que
   terminen **CI**/Deploy. No vuelvas a editar el show hasta que aparezca ese
   commit; al reabrirlo, la ficha ya va a apuntar a la foto dentro de su
   carpeta.

### Cómo queda guardada la foto del show

Terminada la reubicación, la foto queda físicamente en
`content/shows/<carpeta-del-show>/` y el `show.json` de esa misma carpeta
guarda la referencia a ese archivo. Si la subiste con **Select** dentro de la
carpeta, ya nace ahí y no hace falta el commit automático. Al compilar, el
sitio la convierte automáticamente a WebP (versión grande y miniatura)
aplicando la orientación del celular. No hace falta redimensionarla antes,
pero evitá archivos enormes si podés (el repo guarda el original).

Si **Foto principal** queda vacío, el sitio conserva un respaldo: busca una
imagen prioritaria o la primera imagen dentro de la carpeta del show. Por eso
los shows viejos con su foto en la propia carpeta siguen funcionando. Para
los shows nuevos, igual conviene elegirla explícitamente en el campo para que
no haya ambigüedad si en el futuro hay más de una imagen en la carpeta.

### Editar u ocultar un show

- Desde **Shows**, abrí la entrada, cambiá lo que quieras y guardá. Si
  reemplazás la foto con **Select** dentro de la carpeta, queda ubicada de
  inmediato; si la subís con **Upload** directo o arrastrándola y cae en la
  raíz, esperá el commit automático de reubicación antes de seguir editando.
- Cambiar la fecha o el venue **no renombra la carpeta** ya creada; es solo
  un detalle interno y no se ve en el sitio. Si buscás la carpeta en
  **Select** o Media, usá el nombre original de creación.
- Para sacar un show del sitio, activá **Borrador**. Eso solo lo oculta: no
  borra ni el show ni su foto.
- Quitar o reemplazar **Foto principal** cambia la referencia, pero **no
  borra** el archivo. Para borrarlo de verdad: primero quitalo/reemplazalo y
  guardá; después entrá a **Media → Fotos de shows**, abrí la carpeta del
  show y borrá el archivo. Nunca borres primero una foto que un show guardado
  todavía esté usando: la siguiente compilación puede fallar.
- Evitá borrar la entrada del show. Borrar solo el `show.json` deja la
  carpeta y la foto huérfanas y puede romper la compilación. Si realmente
  hay que eliminar un show, pedilo a desarrollo para borrar también su
  carpeta completa.
- El campo **Revisión interna** (`needsReview`) es de solo lectura: es una
  marca interna de datos a revisar y no se edita desde el CMS.
- Ojo con duplicados: dos shows con la **misma fecha y el mismo venue**
  apuntan a la misma carpeta. Antes de crear, buscá si ya existe.

---

## 3) Fotos de una ciudad (galería)

### Agregar fotos a una ciudad que ya existe

1. Andá a **Media → Fotos de galería**.
2. Entrá a la carpeta de la ciudad (ej. `paris`, `tandil`).
3. Con la carpeta abierta, tocá **Upload** —o arrastrá los archivos a la
   ventana de Media— y subí las fotos.
4. Esperá a que terminen todas las subidas.

Eso es todo para el lote de fotos: en la próxima compilación aparecen en la
galería de esa ciudad, ya optimizadas a WebP. No hace falta abrir ni guardar
la ficha de la ciudad, salvo que también quieras elegir/cambiar la portada.

### Crear una ciudad nueva

1. Entrá a **Galerías por ciudad** y creá la entrada **desde la raíz** de la
   colección.
2. Completá **Ciudad** *(obligatoria: también define el nombre de su
   carpeta)* y, si querés, **País**, **Fecha**, **Orden** (menor = aparece
   antes) y **Descripción**. En **Portada** podés subir o elegir ya la foto
   principal. Después **guardá** la ciudad.
3. Si la portada quedó en la raíz de **Fotos de galería**, esperá el commit
   automático de reubicación. La carpeta de la ciudad ya queda creada por el
   guardado de la ficha.
4. Andá a **Media → Fotos de galería** y entrá a la carpeta nueva de la
   ciudad (si no la ves, recargá la vista).
5. Con esa carpeta abierta, tocá **Upload** y subí el lote de fotos.
6. Si no cargaste la portada al crearla y querés fijar una específica, seguí
   los pasos de la sección siguiente. Si te da igual cuál sea, no hace falta
   volver a abrir la ficha.

### Elegir la portada de una ciudad

1. Desde **Galerías por ciudad**, abrí la ciudad.
2. En **Portada**, subí o elegí la foto y verificá que se vea la miniatura
   correcta.
3. Tocá **Guardar**.
4. Si la subida dejó la foto en la raíz de **Fotos de galería**, esperá el
   commit automático **Mueve media del CMS a la carpeta de su ítem** antes de
   seguir editando. Si usás **Select** con la carpeta de la ciudad abierta, la
   foto queda ubicada directamente y no hace falta esa reubicación.

La foto elegida como portada sigue estando dentro de la carpeta de la ciudad,
así que también forma parte de la galería. Si **Portada** queda vacío, el
sitio usa como respaldo una foto cuyo nombre empiece con `cover`, `portada`
o `hero`; si no hay ninguna, usa la primera por orden natural. Ya no hace
falta renombrar archivos para elegir la portada, aunque ese respaldo sigue
funcionando para las ciudades viejas.

El país de la ciudad conviene cargarlo aunque ya haya shows en esa ciudad:
si falta, el sitio intenta deducirlo de los shows, pero lo explícito manda.

---

## 4) Cargar un track o set

Cada track vive en su propia carpeta:
`content/songs/<carpeta-del-track>/`. Ahí quedan juntos el `track.json`, el
archivo de audio y la foto de portada.

### Crear un track nuevo

1. Entrá a **Tracks** y creá la entrada **desde la raíz** de la colección.
2. Completá los datos y los archivos:
   - **Título** *(obligatorio)*: nombre del track o set tal como debe verse.
     También define el nombre de su carpeta.
   - **Artista**: viene como `Tommy Petersen`; cambialo solo si hace falta.
   - **Tipo**: `track`, `set` o `mix`.
   - **Fecha**: publicación o grabación; ordena los tracks y se guarda como
     `AAAA-MM-DD`.
   - **BPM**: entre 60 y 200, opcional.
   - **Tonalidad**: por ejemplo `Am`, `Fm` o `8A`, opcional.
   - **Géneros**: un género por ítem, en el orden en que deben aparecer.
   - **Color de acento**: opcional, en formato `#RRGGBB` (ej. `#FF5A1F`).
   - **SoundCloud para reproducir en el sitio**: usalo solo si **no** vas a
     subir el archivo de audio. Pegá la URL pública completa del track/set
     en SoundCloud.
   - **Links para escuchar afuera**: URLs completas de SoundCloud, Spotify,
     Beatport y/o YouTube donde el track ya está publicado.
   - **Borrador**: viene apagado, así que el track queda publicado al guardar.
   - **Archivo de audio**: subí o elegí el audio y confirmá que el campo
     muestre el archivo correcto.
   - **Portada**: subí o elegí la imagen y confirmá que se vea la miniatura
     correcta.
3. Tocá **Guardar**.
4. Si Pages CMS dejó el audio o la portada en la raíz de **Audio y portadas
   de tracks**, esperá el commit automático **Mueve media del CMS a la
   carpeta de su ítem** y a que terminen **CI**/Deploy. No vuelvas a editar el
   track hasta que aparezca ese commit; al reabrirlo, ambos campos ya van a
   apuntar a archivos dentro de su carpeta.

Formatos de audio aceptados: `mp3`, `wav`, `m4a`, `aac`, `ogg`, `oga`,
`opus`, `flac` y `aiff`. La portada puede ser `jpg`, `jpeg`, `png`, `webp`,
`avif`, `gif`, `tif` o `tiff`; el sitio genera su versión WebP y su miniatura
al compilar.

> Si usás **Upload** directo o arrastrás el archivo sobre **Archivo de
> audio** o **Portada**, puede quedar primero en la raíz `content/songs/`.
> No lo muevas a mano: al guardar la ficha, GitHub Actions lo traslada a la
> carpeta del track y corrige el campo. La automatización solo actúa si el
> archivo quedó cargado en el campo y tocaste **Guardar**; un archivo subido
> suelto desde Media a la raíz no tiene una ficha que lo referencie.

### Duración y onda: no se cargan a mano

No hay campos de duración ni de waveform en el CMS. Cuando el track tiene un
audio local y el JSON no trae esos datos, el sitio intenta calcularlos solo
durante la compilación (los WAV en el propio build y MP3/M4A/otros con la
herramienta de audio disponible en CI). Si en algún entorno no puede
calcularlos, usa una onda visual de respaldo y el track igual puede sonar.
Los tracks viejos que ya tienen duración/peaks guardados los conservan aunque
esos campos no se vean en el formulario.

Si **Archivo de audio** queda vacío pero hay un audio en la carpeta, el sitio
usa el único/primer audio que encuentre. Lo mismo pasa con **Portada**: usa
una imagen prioritaria (`cover`, `portada`, `hero`, etc.) o la primera de la
carpeta. De todos modos, cargalos o elegilos en sus campos para que quede
explícito cuál es el audio y cuál es la portada si alguna vez hay varios
archivos; además, solo un archivo referenciado por la ficha puede ser
reubicado automáticamente si la subida lo dejó en la raíz.

### Links y SoundCloud embebido: cómo se ve en la web

- **Con audio subido:** la tarjeta usa el reproductor del sitio. Si además
  cargaste links en **Links para escuchar afuera**, esos botones también se
  ven en la tarjeta y abren la plataforma en otra pestaña.
- **Sin audio subido, con SoundCloud embebido:** completá **SoundCloud para
  reproducir en el sitio** con la URL pública del track/set. La tarjeta
  mostrará un botón para cargar el reproductor de SoundCloud sin salir del
  sitio y también un botón **SoundCloud** para abrirlo afuera. No pegues acá
  links de Spotify o YouTube: este campo es solo para SoundCloud.
- **Sin audio ni embebido:** la tarjeta muestra los botones de **Links para
  escuchar afuera**. Si tampoco hay links, se verá “Pronto en las
  plataformas”.

Si un set es muy largo o el archivo es muy pesado, subirlo puede tardar
mucho, hacer crecer el repositorio o ser rechazado por GitHub. En esos casos
suele ser mejor no subir el audio y cargar el link/embebido de SoundCloud (u
otro link externo) para que la web redirija a donde ya está publicado.

### Editar u ocultar un track

- Desde **Tracks**, abrí la entrada, cambiá lo que quieras y guardá. Si
  reemplazás el audio o la portada con **Select** dentro de la carpeta,
  quedan ubicados de inmediato; si los subís con **Upload** directo o
  arrastrándolos y caen en la raíz, esperá el commit automático de
  reubicación antes de seguir editando.
- Cambiar el título **no renombra la carpeta** original. Si buscás la carpeta
  en **Select** o Media, usá el nombre creado con el título inicial.
- Para sacar un track del sitio, activá **Borrador**. No borres solo el
  `track.json`: quedarían el audio y la portada huérfanos y la compilación
  podría fallar por una carpeta sin su JSON. Para una eliminación completa,
  pedilo a desarrollo.
- Quitar **Archivo de audio** o **Portada** de la ficha no borra el archivo.
  Para borrarlo: primero quitalo/reemplazalo y guardá; después entrá a
  **Media → Audio y portadas de tracks**, abrí la carpeta del track y borrá
  el archivo. Nunca borres primero un archivo que la ficha guardada todavía
  esté usando.
- Ojo con duplicados: dos tracks con el **mismo título** apuntan a la misma
  carpeta. Antes de crear, buscá si ya existe.

---

## 5) Cambiar la imagen hero de la portada del sitio — reemplazo manual

Esta hero es la imagen grande de la portada del sitio (no la foto principal
de un show). **No está en Pages CMS** y no hay ninguna acción automática que
la convierta. Cuando haya que cambiarla, desarrollo debe:

1. Poner la foto vertical nueva como `media-src/images/hero/hero.jpg`.
2. Correr `pnpm optimize:images` para regenerar
   `public/media/images/hero/hero.webp`.
3. Commitear ese derivado y esperar el deploy normal de `main`.

---

## 6) Datos del sitio

En **Sitio** podés editar:

- **Artista** y **Agencia**.
- **Frase principal** en inglés y/o español (podés dejar una vacía, pero no
  borres el bloque completo).
- **Contacto**: email, WhatsApp (URL completa, ej. de `wa.link`), la lista
  de perfiles de **Instagram** (una URL por ítem, con los botones de
  agregar/quitar), **YouTube** y **SoundCloud**.
- **Géneros**: un género por ítem, en el orden en que deben mostrarse.

El archivo del sitio no se puede borrar ni renombrar desde el CMS (está
bloqueado a propósito).

---

## 7) Publicación: qué pasa después de guardar

1. Pages CMS guarda uno o más commits en GitHub: la subida de cada archivo y
   el guardado de la ficha pueden ser commits separados.
2. Si un archivo cargado en la ficha quedó en la raíz de su media, la acción
   **Ubicar media del CMS en su carpeta** lo mueve a la carpeta del ítem,
   corrige el JSON y agrega el commit automático **Mueve media del CMS a la
   carpeta de su ítem**.
3. La acción **CI** valida el contenido ya ubicado y compila el sitio
   (incluidas la conversión a WebP de las fotos de `content/` y la copia de
   los audios).
4. Solo en `main`, la acción **Deploy to GitHub Pages** publica el sitio.
   Cuando hubo reubicación, se relanza sobre el commit corregido; puede
   verse también una corrida intermedia correspondiente al guardado original.

El proceso completo puede tardar unos minutos. Si no ves el cambio, esperá a
que termine la última acción (pestaña **Actions** del repo) y recargá la
página con `Ctrl+Shift+R` (o cerrá y abrí la pestaña en el celular). No
vuelvas a editar la misma ficha hasta que haya aparecido el commit
automático de reubicación, si corresponde.

Si **CI** o **Ubicar media del CMS en su carpeta** quedan en rojo, el sitio
**no** se actualiza pero tampoco se rompe el que está online: queda la
versión anterior. Revisá el último cambio o avisá a desarrollo con el link
de la acción fallida. La reubicación se detiene sin mover nada si el JSON
apunta a un archivo de raíz que no existe o si el mismo archivo de raíz está
referenciado por más de un ítem.

---

## 8) Errores comunes

- **"No encuentro la carpeta del ítem en Select"** → no hace falta crearla a
  mano: completá la ficha y tocá **Guardar**. Si querés usar **Select** en un
  ítem ya existente y le cambiaste fecha/venue, ciudad o título, buscá la
  carpeta con el nombre original de creación. Podés confirmarlo en la Media
  correspondiente o recargar la vista si recién la creaste.
- **"Subí la foto y no aparece en el show"** → verificá que **Foto
  principal** muestre la miniatura y que hayas tocado **Guardar** después de
  cargarla. Si quedó en la raíz de **Fotos de shows**, no la muevas ni la
  borres a mano: esperá el commit automático **Mueve media del CMS a la
  carpeta de su ítem** y el Deploy siguiente. Si la acción **Ubicar media del
  CMS en su carpeta** terminó en rojo o nunca apareció ese commit, avisá a
  desarrollo con el link de Actions.
- **"Subí la foto y no aparece en la ciudad"** → distinguí dos casos. Si era
  la **Portada** cargada en la ficha, guardá y esperá la reubicación
  automática. Si era una foto del lote subida desde Media y quedó en la raíz
  de **Fotos de galería**, la automatización no sabe a qué ciudad pertenece:
  movéla con **⋮ → Rename** a `<carpeta-de-la-ciudad>/<foto>` o borrala y
  subila de nuevo **dentro de la carpeta** correcta (ver §3).
- **"Subí el audio/la portada y el track no suena o no muestra la tapa"** →
  verificá que **Archivo de audio** y **Portada** muestren los archivos
  correctos y que hayas tocado **Guardar**. Si quedaron en la raíz de
  **Audio y portadas de tracks**, esperá el commit automático de reubicación
  y el Deploy corregido; no los muevas a mano mientras la acción está en
  curso. Si no hay audio local, revisá que tenga el embebido de SoundCloud o
  al menos un link externo.
- **"Cargué el link y no se ve el botón en la web"** → verificá que la URL
  esté completa en **Links para escuchar afuera** (o en el campo de
  SoundCloud embebido) y que hayas guardado. Los botones externos se muestran
  también cuando el track tiene audio propio; esperá a que termine el
  Deploy y recargá con `Ctrl+Shift+R`.
- **"El CMS no muestra las colecciones"** → estás en una rama sin
  `.pages.yml`. Cambiá a `main` (o a la rama de prueba indicada).
- **"No encuentro un país en la lista"** → la lista tiene los 249 códigos
  oficiales ISO 3166-1; escribí parte del nombre para buscar. Kosovo (`XK`)
  no es un código ISO oficial y no está: si hace falta, pedilo a desarrollo.
- **"Quiero borrar un show o un track"** → activalo como **Borrador**. No
  borres `show.json`, `city.json` o `track.json` ni renombres carpetas desde
  el CMS: puede dejar carpetas/archivos huérfanos y romper la compilación.
  Para borrar un archivo puntual, primero quitá su referencia de la ficha y
  guardá; recién después borralo desde la carpeta del ítem en Media.
- **"La imagen hero de la portada del sitio no cambia"** → no se administra
  desde el CMS; hay que hacer el reemplazo manual de §5 y esperar el
  **Deploy**. No confundirla con la foto principal de un show, que sí se
  gestiona desde el formulario del show según §2.

---

## 9) Referencia técnica (para desarrollo)

- Configuración del CMS: `.pages.yml` en la raíz (colecciones `shows`,
  `galerias`, `tracks`, `sitio`; medias `shows`, `galeria` y `tracks`;
  componente reutilizable `pais` con los 249 códigos ISO, ordenados por
  nombre en español). `settings.content.merge: true` preserva claves JSON no
  expuestas en el formulario (ej. `id`, `photo`, `audioSrc`, `duration` o
  `waveformPeaks` heredados).
- Los campos de imagen/archivo suben inicialmente a la raíz fija de su media
  (`content/shows`, `content/gallery` o `content/songs`); Pages CMS no
  interpola la carpeta del ítem en `options.path`. Al guardar el JSON que
  referencia una ruta raíz, `scripts/relocate-content-media.mjs` la mueve a
  la carpeta del show/ciudad/track y reescribe la ruta pública a
  `/media/content/<tipo>/<carpeta-del-ítem>/<archivo>`. Lo ejecuta
  `.github/workflows/relocate-content-media.yml`, que commitea el resultado
  con `github-actions[bot]`, evita loops por actor/concurrencia y, como los
  pushes con `GITHUB_TOKEN` no disparan otros workflows, relanza CI mediante
  `workflow_dispatch` y —solo en `main`— también el Deploy. El script no
  adivina archivos raíz sin referencias, falla sin mover nada si falta el
  archivo o si lo comparten varios ítems, reutiliza un destino idéntico y
  usa sufijos `-1`, `-2`, … ante nombres ocupados con otro contenido. Si el
  campo queda vacío, sigue el auto-pick local por carpeta como respaldo.
- Ya no existe una carpeta común de fotos de shows en la configuración ni en
  el sync/loaders: cada archivo nuevo debe vivir en la carpeta de su show,
  ciudad o track. `scripts/sync-media.ts` deriva/copia desde esas carpetas a
  `public/media/content/…` y la resolución final respeta
  `NEXT_PUBLIC_MEDIA_BASE_URL` a través de las rutas de media del sitio.
- Tracks: el CMS expone los metadatos de `TrackSchema` salvo `id`,
  `audioSrc`, `duration` y `waveformPeaks`. `loadTracks` autoelige
  audio/portada desde `content/songs/<carpeta>/` si el JSON no los declara y
  calcula duración/peaks durante el build cuando faltan. Las referencias
  `audio`/`cover` de los tracks existentes se guardan como rutas públicas
  completas (`/media/content/songs/<carpeta>/<archivo>`) para que los campos
  file/image de Pages CMS las acepten; el loader también sigue aceptando el
  nombre suelto histórico para contenido creado a mano/por CLI.
- `MusicSection` renderiza los botones de `links.soundcloud/spotify/
  beatport/youtube` en todas las tarjetas que los tengan (con audio propio,
  con embebido o solo externos) y usa `embedUrl` como reproductor embebido
  de SoundCloud cuando no hay audio propio; si falta `links.soundcloud`,
  esa misma URL pública se reutiliza como botón externo de SoundCloud.
- Países sin listas a mano: `src/lib/countries.ts` deriva nombre
  (`Intl.DisplayNames`), bandera (regional indicators) y normalización del
  código; los loaders y la UI excluyen el país vacío de contadores y
  filtros.
- `public/media/images` no está expuesto en el CMS y no tiene optimizador
  ni automatización propia: el hero se reemplaza manualmente según §5. El
  único workflow nuevo de esta integración es el de reubicación de media de
  `content/` descripto arriba.
