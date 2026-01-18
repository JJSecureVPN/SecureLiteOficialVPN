import { execSync } from "child_process";
import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

/*
  build-inline-visual.ts para Secure
  Genera un HTML inline con todo el CSS embebido, sin JS, para versión visual solo
*/

interface ManifestEntry {
  file: string;
  src?: string;
  css?: string[];
  isEntry?: boolean;
  imports?: string[];
}
type Manifest = Record<string, ManifestEntry>;

const log = (...args: unknown[]) => console.log(...args);

const runBuild = () => {
  log("🔧 Ejecutando build (npm run build)...");
  try {
    execSync("npm run build", { stdio: "inherit" });
  } catch (e) {
    console.error("❌ Error al compilar:", (e as Error)?.message || e);
    process.exit(1);
  }
};

const loadManifest = (distDir: string): Manifest | null => {
  const manifestPath = join(distDir, ".vite", "manifest.json");
  if (!existsSync(manifestPath)) {
    // Fallback to old location
    const oldPath = join(distDir, "manifest.json");
    if (existsSync(oldPath)) {
      try { return JSON.parse(readFileSync(oldPath, "utf8")); } catch { return null; }
    }
    return null;
  }
  try { return JSON.parse(readFileSync(manifestPath, "utf8")); } catch { return null; }
};

const pickEntry = (manifest: Manifest | null): ManifestEntry | null => {
  if (!manifest) return null;
  const candidates = Object.entries(manifest)
    .filter(([, v]) => v.isEntry)
    .map(([k, v]) => ({ key: k, entry: v }));
  if (!candidates.length) return null;
  const prioritized = candidates.find(c => /main\.(t|j)sx?$/.test(c.key)) || candidates[0];
  return prioritized.entry;
};

const gatherCssFromEntry = (entry: ManifestEntry, manifest: Manifest): string[] => {
  const collected = new Set<string>();
  const visit = (e: ManifestEntry) => {
    e.css?.forEach(c => collected.add(c));
    e.imports?.forEach(imp => { const m = manifest[imp]; if (m) visit(m); });
  };
  visit(entry);
  return Array.from(collected);
};

function main() {
  const distDir = join(process.cwd(), "dist");
  const assetsDir = join(distDir, "assets");

  runBuild();

  if (!existsSync(distDir)) {
    console.error("❌ No se encontró el directorio dist");
    process.exit(1);
  }

  const manifest = loadManifest(distDir);
  const entry = pickEntry(manifest);

  let cssFiles: string[] = [];

  if (entry) {
    cssFiles = gatherCssFromEntry(entry, manifest!);
  } else {
    // Fallback: buscar archivos en assets
    if (existsSync(assetsDir)) {
      const files = readdirSync(assetsDir);
      const css = files.find(f => f.endsWith(".css"));
      if (css) cssFiles = [`assets/${css}`];
    }
  }

  log(`🎨 CSS: ${cssFiles.length ? cssFiles.join(", ") : "ninguno"}`);

  // Leer contenidos CSS
  let cssContent = "";
  for (const cssPath of cssFiles) {
    cssContent += readFileSync(join(distDir, cssPath), "utf8") + "\n";
  }

  // Generar HTML inline solo con CSS, sin JS, para versión visual
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <meta name="theme-color" content="#f8f7ff" />
  <title>Secure Tunnel</title>
  <script>
    (function(){
      try{
        var stored=localStorage.getItem('vpn_theme');
        var theme=(stored==='dark'||stored==='light')?stored:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
        document.documentElement.dataset.theme=theme;
      }catch(e){}
    })();
  </script>
  <!-- Estilos críticos inline primero para evitar pantalla negra -->
  <style>
    /* Critical CSS - mostrar algo mientras carga */
    *{box-sizing:border-box;margin:0;padding:0}
    html,body,#root{height:100%;width:100%;background-color:#f8f7ff;background-image:linear-gradient(180deg,transparent 0%,transparent 70%,rgba(0,0,0,.18) 90%,rgba(0,0,0,.55) 96%,#000 100%),linear-gradient(180deg,#efeaff,#f8f7ff);color:#1f2937}
    html[data-theme=dark],html[data-theme=dark] body,html[data-theme=dark] #root{background-color:#09090a;background-image:linear-gradient(180deg,transparent 0%,transparent 70%,rgba(0,0,0,.18) 90%,rgba(0,0,0,.55) 96%,#000 100%),linear-gradient(180deg,#24262d,#09090a);color:#e5e7eb}
    body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
    #root:empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
    #root:empty::before{content:'🔒';font-size:48px}
    #root:empty::after{content:'';width:32px;height:32px;border:3px solid rgba(55,37,128,.14);border-top-color:#6d4aff;border-radius:50%;animation:spin 1s linear infinite}
    html[data-theme=dark] #root:empty::after{border-color:rgba(248,247,255,.14);border-top-color:#6d4aff}
    @keyframes spin{to{transform:rotate(360deg)}}
    @media(prefers-reduced-motion:reduce){#root:empty::after{animation:none}}
  </style>
  <!-- Fuentes cargadas de forma no bloqueante -->
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,200..900;1,9..144,200..900&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" media="print" onload="this.media='all'" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" media="print" onload="this.media='all'" />
  <!-- Estilos de la app -->
  <style>
${cssContent}
  </style>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

  const outPath = join(distDir, "Secure-nojs.html");
  writeFileSync(outPath, html, "utf8");

  const sizeKB = (Buffer.byteLength(html, "utf8") / 1024).toFixed(1);
  log(`✅ Generado: ${outPath} (${sizeKB} KB)`);
}

main();

// cd "C:/Users/JHServices/Documents/SecureSRC/Secure" && npx tsx build-inline-visual.ts