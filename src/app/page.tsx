/**
 * Raíz `/` -> redirige al locale default (`/es/`).
 *
 * En export estático no hay middleware ni server, así que la redirección se
 * hace con meta-refresh (+ fallback JS y link manual), respetando el basePath
 * cuando el sitio corre en un subdirectorio (GitHub Pages project site).
 */
export default function RootPage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const target = `${basePath}/es/`;

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="refresh" content={`0; url=${target}`} />
        <title>Redirigiendo… | In The Loop Agency</title>
        <script dangerouslySetInnerHTML={{ __html: `window.location.replace("${target}");` }} />
      </head>
      <body>
        <p>
          Redirigiendo a <a href={target}>In The Loop</a>…
        </p>
      </body>
    </html>
  );
}
