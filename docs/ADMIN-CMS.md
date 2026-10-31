# Administrar el sitio con Pages CMS

Esta guía es para cargar y editar el contenido del sitio de Tommy Petersen /
In The Loop **sin tocar código**, desde [pagescms.org](https://pagescms.org).

El sitio no tiene usuarios ni contraseñas propias: el acceso es tu cuenta de
**GitHub**. Cada vez que guardás algo en Pages CMS, se crea un commit en el
repositorio; GitHub Actions valida el contenido, compila el sitio y (solo en
la rama `main`) lo publica en GitHub Pages.

> **Fase A (esta guía):** shows, galerías por ciudad y datos del sitio.
> La foto principal (hero) no se gestiona desde el CMS; §4 solo resume su
> reemplazo manual. Los tracks y videos quedan para una segunda fase.

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
| **Shows** | Crear y editar shows (venue, fecha, ciudad, país, foto). |
| **Galerías por ciudad** | Datos de cada ciudad con fotos (país, portada, orden). |
| **Sitio** | Artista, agencia, frase principal, contacto y géneros. |
| **Media → Fotos de shows** | Archivos de imagen dentro de `content/shows/`. |
| **Media → Fotos de galería** | Archivos de imagen dentro de `content/gallery/`. |

---

## 2) Cargar un show nuevo

1. Entrá a **Shows** y creá la entrada con el botón de nuevo ítem **desde la
   raíz de la colección** (no desde el menú contextual de otro show, así la
   carpeta se crea en el lugar correcto).
2. Completá, en este orden:
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
   - **Borrador**: si está activado, el show no aparece en el sitio. Usalo
     para preparar shows o para ocultar uno sin borrarlo.
3. **Guardá** el show **sin foto todavía**. La carpeta del show se crea con
   fecha y venue (ej. `2026-03-14-club-ejemplo/`).

### Agregar la foto del show

4. Volvé a abrir el show recién creado.
5. En **Foto principal**, tocá **Select** (no *Upload*).
6. En la ventana de media, entrá a la **carpeta de este show** (la que
   empieza con su fecha) y recién ahí usá **Upload** para subir la foto, o
   elegí una que ya esté en esa carpeta.
7. Guardá de nuevo.

> ⚠️ ¿Por qué con **Select** y dentro de la carpeta? El botón *Upload* del
> campo sube el archivo a la **raíz** de la biblioteca, y ahí el sitio no lo
> encuentra: cada show solo usa las fotos que están **dentro de su propia
> carpeta**. Si subiste una foto a la raíz por error, borrala y volvé a
> subirla dentro de la carpeta correcta.

Al compilar, el sitio convierte automáticamente la foto a WebP (versión
grande y miniatura) aplicando la orientación del celular. No hace falta
redimensionarla antes, pero evitá archivos enormes si podés (el repo guarda
el original).

### Editar u ocultar un show

- Desde **Shows**, abrí la entrada, cambiá lo que quieras y guardá.
- Cambiar la fecha o el venue **no renombra la carpeta** ya creada; es solo
  un detalle interno y no se ve en el sitio.
- Para sacar un show del sitio, activá **Borrador**. Evitá borrar la
  entrada: borrar el `show.json` deja la carpeta huérfana y puede romper la
  compilación. Si realmente hay que eliminar un show, pedilo a desarrollo
  para borrar también su carpeta.
- El campo **Revisión interna** (`needsReview`) es de solo lectura: es una
  marca interna de datos a revisar y no se edita desde el CMS.
- Ojo con duplicados: dos shows con la **misma fecha y el mismo venue**
  apuntan a la misma carpeta. Antes de crear, buscá si ya existe.

---

## 3) Fotos de una ciudad (galería)

### Agregar fotos a una ciudad que ya existe

1. Andá a **Media → Fotos de galería**.
2. Entrá a la carpeta de la ciudad (ej. `paris`, `tandil`).
3. Con la carpeta abierta, tocá **Upload** y subí las fotos.

Eso es todo: en la próxima compilación, las fotos de la carpeta aparecen en
la galería de esa ciudad, ya optimizadas a WebP.

### Crear una ciudad nueva

1. Entrá a **Galerías por ciudad** y creá la entrada **desde la raíz** de la
   colección.
2. Completá **Ciudad** *(obligatoria: también define el nombre de su
   carpeta)* y, si querés, **País**, **Fecha**, **Orden** (menor = aparece
   antes) y **Descripción**. Guardá.
3. Andá a **Media → Fotos de galería**, entrá a la carpeta nueva y subí las
   fotos (si no la ves, recargá la vista).
4. Para elegir la portada: volvé a abrir la ciudad, y en **Foto de portada**
   usá **Select**, entrá a la carpeta de esa ciudad y elegí la foto. Guardá.

El país de la ciudad conviene cargarlo aunque ya haya shows en esa ciudad:
si falta, el sitio intenta deducirlo de los shows, pero lo explícito manda.

---

## 4) Cambiar la foto principal (hero) — reemplazo manual

El hero **no está en Pages CMS** y no hay ninguna acción automática que lo
convierta. Cuando haya que cambiarlo, desarrollo debe:

1. Poner la foto vertical nueva como `media-src/images/hero/hero.jpg`.
2. Correr `pnpm optimize:images` para regenerar
   `public/media/images/hero/hero.webp`.
3. Commitear ese derivado y esperar el deploy normal de `main`.

---

## 5) Datos del sitio

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

## 6) Publicación: qué pasa después de guardar

1. Pages CMS guarda un commit en GitHub.
2. La acción **CI** valida el contenido y compila el sitio (incluida la
   conversión a WebP de las fotos de `content/`).
3. Solo en `main`, la acción **Deploy to GitHub Pages** publica el sitio.

El proceso completo puede tardar unos minutos. Si no ves el cambio, esperá
a que las acciones terminen (pestaña **Actions** del repo) y recargá la
página con `Ctrl+Shift+R` (o cerrá y abrí la pestaña en el celular).

Si la acción **CI** queda en rojo, el sitio **no** se actualiza pero tampoco
se rompe el que está online: queda la versión anterior. Revisá el último
cambio (un dato obligatorio vacío o una URL mal pegada son las causas más
comunes) o avisá a desarrollo con el link de la acción fallida.

---

## 7) Errores comunes

- **"Subí la foto y no aparece en el show/la ciudad"** → casi seguro quedó
  en la raíz de la biblioteca. Borrala de ahí y subila de nuevo **dentro de
  la carpeta** del show/ciudad (con **Select**, ver §2 y §3).
- **"El CMS no muestra las colecciones"** → estás en una rama sin
  `.pages.yml`. Cambiá a `main` (o a la rama de prueba indicada).
- **"No encuentro un país en la lista"** → la lista tiene los 249 códigos
  oficiales ISO 3166-1; escribí parte del nombre para buscar. Kosovo (`XK`)
  no es un código ISO oficial y no está: si hace falta, pedilo a desarrollo.
- **"Quiero borrar un show"** → activalo como **Borrador**. No borres
  `show.json`/`city.json` ni renombres carpetas desde el CMS: puede dejar
  carpetas huérfanas y romper la compilación.
- **"La foto del hero no cambia"** → no se administra desde el CMS; hay que
  hacer el reemplazo manual de §4 y esperar el **Deploy**.

---

## 8) Referencia técnica (para desarrollo)

- Configuración del CMS: `.pages.yml` en la raíz (colecciones `shows`,
  `galerias`, `sitio`; medias `shows` y `galeria`; componente reutilizable
  `pais` con los 249 códigos ISO, ordenados por nombre en español).
  `settings.content.merge: true` preserva claves JSON no expuestas en el
  formulario (ej. `id`, `photo` heredado).
- Pages CMS guarda las imágenes de `content/` como rutas públicas
  (`/media/content/shows/<slug>/foto.jpg`). `resolveMediaValue`
  (`src/lib/content-media.ts`) y `findLocalFile` (`src/lib/content.ts`)
  las resuelven al archivo de la carpeta cuando el nombre coincide con un
  único archivo, así pasan por la derivación WebP normal de
  `scripts/sync-media.ts` y respetan `NEXT_PUBLIC_MEDIA_BASE_URL`.
- Países sin listas a mano: `src/lib/countries.ts` deriva nombre
  (`Intl.DisplayNames`), bandera (regional indicators) y normalización del
  código; los loaders y la UI excluyen el país vacío de contadores y
  filtros.
- `public/media/images` no está expuesto en el CMS y no tiene optimizador
  ni workflow nuevo: el hero se reemplaza manualmente según §4.
