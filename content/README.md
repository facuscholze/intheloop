# content/ — DATOS DEL SITIO

Todo lo que se muestra (temas, videos, shows, textos) vive en JSON acá, separado
del diseño. Los archivos multimedia en `public/media/` por sí solos no aparecen
en la página: cada tema necesita un JSON en `content/tracks/` que lo registre y
apunte a su audio y su portada.

Para agregar un tema nuevo, dejá los originales en `media-src/` y ejecutá
`pnpm add:track`; el script copia los archivos a `public/media/` y crea el JSON
en `content/tracks/`. Si ya copiaste los archivos directamente a `public/media/`,
creá el JSON de la pista en `content/tracks/` con `audioSrc` y `cover` relativos
a `public/media/`.
