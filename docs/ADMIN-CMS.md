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
| **Media → Fotos de shows** | Carpetas individuales de los shows. El flujo normal es elegir la foto desde la ficha con **Select**; Media sirve para revisar, mover o limpiar archivos. |
| **Media → Fotos de galería** | Subir el lote de fotos de cada ciudad dentro de su carpeta. La portada se elige desde la ficha con **Select**. |
| **Media → Audio y portadas de tracks** | Carpetas individuales de los tracks. El flujo normal es elegir audio y portada desde la ficha con **Select**; Media sirve para revisar, mover o limpiar archivos. |

### Regla clave: cada archivo en la carpeta de su ítem

Las fotos y audios **no van a una carpeta común**:

- la foto de un show queda en `content/shows/<carpeta-del-show>/`;
- las fotos y la portada de una ciudad quedan en
  `content/gallery/<carpeta-de-la-ciudad>/`;
- el audio y la portada de un track quedan en
  `content/songs/<carpeta-del-track>/`.

Para los campos **Foto principal**, **Portada** y **Archivo de audio** usá
siempre **Select**, navegá hasta entrar a la carpeta del ítem y recién ahí
subí o elegí el archivo. **No uses el botón Upload directo del campo ni
arrastres el archivo sobre el campo**: eso lo sube a la raíz de la media
(`content/shows/`, `content/gallery/` o `content/songs/`), no a la carpeta
del ítem.

Cuando el ítem es nuevo, su carpeta todavía no existe durante la primera
carga. Por eso el flujo es:

1. completá los datos y **guardá** el ítem sin el archivo;
2. **volvé a abrirlo**;
3. usá **Select** y entrá a la carpeta que se acaba de crear;
4. subí o elegí el archivo dentro de esa carpeta;
5. **guardá de nuevo**.

Los shows y tracks nuevos nacen **publicados** (la casilla **Borrador** viene
apagada). Eso significa que, en producción, el primer guardado puede mostrar
el ítem por unos minutos sin foto o sin audio. Completá el segundo paso
enseguida. Si no vas a poder terminarlo en el momento, activá **Borrador**
antes del primer guardado y desactivalo al final.

> La subida de un archivo crea el archivo en GitHub apenas termina, incluso
> antes de guardar la ficha. Si subís algo y salís sin guardar, puede quedar
> huérfano en la carpeta. No suele romper el sitio, pero conviene completar
> la ficha o avisar a desarrollo para limpiarlo.

Si no encontrás la carpeta dentro de **Select**, fijate que la ficha ya esté
guardada. La carpeta se crea con los datos originales (fecha + venue del
show, ciudad de la galería o título del track); cambiar esos datos después
**no renombra** la carpeta. Podés confirmar el nombre entrando a la Media
correspondiente y mirando la lista de carpetas.

---

## 2) Cargar un show nuevo

1. Entrá a **Shows** y creá la entrada con el botón de nuevo ítem **desde la
   raíz de la colección** (no desde el menú contextual de otro show, así la
   carpeta se crea en el lugar correcto).
2. En esta primera etapa completá:
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
   - **Borrador**: viene apagado, así que el show queda publicado desde el
     primer guardado. Activalo solo si querés prepararlo u ocultarlo sin
     borrarlo.
   - Dejá **Foto principal** vacío todavía.
3. Tocá **Guardar**. Ese primer guardado crea la carpeta del show.
4. Volvé a abrir el mismo show desde **Shows**.
5. En **Foto principal**, tocá **Select** (no **Upload** y no arrastrar el
   archivo sobre el campo).
6. En el cuadro que se abre, entrá a la carpeta de este show. Recién con esa
   carpeta abierta:
   - si la foto ya está ahí, seleccionala;
   - si todavía no está, usá el **Upload del propio cuadro Select** para
     subirla dentro de esa carpeta y después seleccionala.
7. Confirmá la selección, verificá que el campo muestre la miniatura correcta
   y tocá **Guardar** otra vez.

### Cómo queda guardada la foto del show

La foto queda físicamente en `content/shows/<carpeta-del-show>/` y el
`show.json` de esa misma carpeta guarda la referencia a ese archivo. Al
compilar, el sitio la convierte automáticamente a WebP (versión grande y
miniatura) aplicando la orientación del celular. No hace falta redimensionarla
antes, pero evitá archivos enormes si podés (el repo guarda el original).

Si **Foto principal** queda vacío, el sitio conserva un respaldo: busca una
imagen prioritaria o la primera imagen dentro de la carpeta del show. Por eso
los shows viejos con su foto en la propia carpeta siguen funcionando. Para
los shows nuevos, igual conviene elegirla explícitamente con **Select** para
que no haya ambigüedad si en el futuro hay más de una imagen en la carpeta.

### Editar u ocultar un show

- Desde **Shows**, abrí la entrada, cambiá lo que quieras y guardá. En un
  show que ya existe, la carpeta ya está creada: podés usar **Select**
  directamente.
- Cambiar la fecha o el venue **no renombra la carpeta** ya creada; es solo
  un detalle interno y no se ve en el sitio. Al buscarla en **Select**, usá
  el nombre original de creación.
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
   antes) y **Descripción**. Dejá **Portada** vacía en esta primera etapa y
   **guardá** la ciudad.
3. Andá a **Media → Fotos de galería**.
4. Entrá a la carpeta nueva de la ciudad (si no la ves, recargá la vista).
5. Con esa carpeta abierta, tocá **Upload** y subí las fotos.
6. Si querés fijar una portada específica, seguí los pasos de la sección
   siguiente. Si te da igual cuál sea, no hace falta volver a abrir la ficha.

### Elegir la portada de una ciudad

1. Desde **Galerías por ciudad**, abrí la ciudad ya guardada.
2. En **Portada**, tocá **Select** (no **Upload** y no arrastrar el archivo
   sobre el campo).
3. Entrá a la carpeta de esa ciudad. Recién ahí:
   - elegí una de las fotos ya subidas, o
   - usá el **Upload del propio cuadro Select** para subir la portada dentro
     de esa carpeta y después seleccionala.
4. Confirmá la selección, verificá la miniatura y tocá **Guardar**.

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
2. En esta primera etapa completá los datos:
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
   - **Borrador**: viene apagado, así que el track queda publicado desde el
     primer guardado.
   - Dejá **Archivo de audio** y **Portada** vacíos todavía.
3. Tocá **Guardar**. Ese primer guardado crea la carpeta del track.
4. Volvé a abrir el mismo track desde **Tracks**.
5. En **Archivo de audio**, tocá **Select**. Entrá a la carpeta de este track
   y recién ahí usá el **Upload del cuadro Select** para subir el audio (o
   elegí uno que ya esté). Confirmá que el campo muestre el archivo correcto.
6. En **Portada**, tocá **Select**, entrá a la **misma carpeta del track** y
   subí o elegí la imagen ahí. Confirmá que se vea la miniatura correcta.
7. Tocá **Guardar** otra vez.

Formatos de audio aceptados: `mp3`, `wav`, `m4a`, `aac`, `ogg`, `oga`,
`opus`, `flac` y `aiff`. La portada puede ser `jpg`, `jpeg`, `png`, `webp`,
`avif`, `gif`, `tif` o `tiff`; el sitio genera su versión WebP y su miniatura
al compilar.

> No uses **Upload** directo ni arrastrar sobre **Archivo de audio** o
> **Portada**: el archivo caería en la raíz `content/songs/`, fuera de la
> carpeta del track. Siempre es **Select → carpeta del track → Upload dentro
> del cuadro Select/elegir archivo**.

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
carpeta. De todos modos, elegilos con **Select** para que quede explícito
cuál es el audio y cuál es la portada si alguna vez hay varios archivos.

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

- Desde **Tracks**, abrí la entrada, cambiá lo que quieras y guardá. En un
  track existente, la carpeta ya está creada: podés usar **Select**
  directamente.
- Cambiar el título **no renombra la carpeta** original. Al elegir archivos
  con **Select**, entrá a la carpeta creada con el título inicial.
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

1. Pages CMS guarda uno o más commits en GitHub. En el flujo de dos pasos
   puede haber varios: el primer guardado de la ficha, la subida del archivo
   dentro de **Select**/Media y el segundo guardado de la ficha.
2. La acción **CI** valida el contenido y compila el sitio (incluidas la
   conversión a WebP de las fotos de `content/` y la copia de los audios).
3. Solo en `main`, la acción **Deploy to GitHub Pages** publica el sitio.

El proceso completo puede tardar unos minutos y puede haber corridas
intermedias mientras completás el segundo paso. Si no ves el cambio, esperá
a que termine la última acción (pestaña **Actions** del repo) y recargá la
página con `Ctrl+Shift+R` (o cerrá y abrí la pestaña en el celular).

Si la acción **CI** queda en rojo, el sitio **no** se actualiza pero tampoco
se rompe el que está online: queda la versión anterior. Revisá el último
cambio (un dato obligatorio vacío, una URL mal pegada o un archivo elegido
fuera de la carpeta del ítem son causas comunes) o avisá a desarrollo con el
link de la acción fallida.

---

## 8) Errores comunes

- **"No encuentro la carpeta del ítem en Select"** → primero guardá la ficha:
  la carpeta no existe hasta ese momento. Si el ítem ya existía y le
  cambiaste fecha/venue, ciudad o título, buscá la carpeta con el nombre
  original de creación. Podés confirmarlo en la Media correspondiente o
  recargar la vista si recién la creaste.
- **"Subí la foto y no aparece en el show"** → abrí el show y verificá que
  **Foto principal** muestre la miniatura y que hayas tocado **Guardar**
  después de elegirla. Si usaste **Upload** directo o arrastraste sobre el
  campo, la foto pudo quedar en la raíz de **Fotos de shows**: quitala del
  campo, movéla en Media con **⋮ → Rename** a
  `<carpeta-del-show>/<foto>` —o borrala y repetí el flujo **Select** dentro
  de la carpeta—, después reabrí el show, seleccionala y guardá.
- **"Subí la foto y no aparece en la ciudad"** → casi seguro quedó en la raíz
  de **Fotos de galería**. Movéla en Media con **⋮ → Rename** a
  `<carpeta-de-la-ciudad>/<foto>` o borrala y subila de nuevo **dentro de la
  carpeta** correcta (ver §3). Si el problema es solo la portada, abrí la
  ciudad, volvé a elegirla con **Select** dentro de su carpeta y guardá.
- **"Subí el audio/la portada y el track no suena o no muestra la tapa"** →
  abrí el track y verificá que **Archivo de audio** y **Portada** apunten a
  archivos dentro de la carpeta del track y que hayas guardado después de
  elegirlos. Si quedaron en la raíz de **Audio y portadas de tracks**,
  movélos/borralos y repetí **Select** dentro de la carpeta. Si no hay audio
  local, revisá que tenga el embebido de SoundCloud o al menos un link
  externo.
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
- Los campos de imagen/archivo solo pueden apuntar a la raíz fija de su
  media (`content/shows`, `content/gallery` o `content/songs`); Pages CMS no
  interpola la carpeta del ítem en `options.path`. Por eso el flujo oficial
  es guardar primero el ítem y usar **Select** navegando hasta su carpeta:
  el Upload/drag directo del campo cae en la raíz de la media, mientras que
  el Upload dentro del diálogo **Select** usa la carpeta abierta en ese
  momento. Pages CMS guarda entonces la ruta pública
  (`/media/content/<tipo>/<carpeta-del-ítem>/<archivo>`) y los loaders la
  resuelven contra los archivos de esa carpeta. Si el campo queda vacío,
  sigue el auto-pick local por carpeta como respaldo.
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
  ni workflow nuevo: el hero se reemplaza manualmente según §5.
