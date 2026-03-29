import { ref } from "vue";

const speedtestDownload = ref("0 Mbps");
const speedtestUpload = ref("0 Mbps");
const speedtestPing = ref("-- ms");
const speedtestJitter = ref("-- ms");
const speedtestTime = ref("Estado: listo");
const speedtestNeedleAngle = ref(-90);
const speedtestCurrentSpeed = ref("0.0");
const speedtestIsRunning = ref(false);

const SPEEDOMETER_VISUAL_LIMIT = 100;

const setSpeedometer = (mbps) => {
  const safeSpeed = Number.isFinite(mbps) ? Math.max(0, mbps) : 0;
  const clamped = Math.min(SPEEDOMETER_VISUAL_LIMIT, safeSpeed);
  const angle = -90 + (clamped / SPEEDOMETER_VISUAL_LIMIT) * 180;
  speedtestNeedleAngle.value = angle;
  speedtestCurrentSpeed.value = safeSpeed.toFixed(1);
};

const calcJitter = (samples) => {
  if (samples.length < 2) return 0;
  let totalDelta = 0;
  for (let i = 1; i < samples.length; i += 1) {
    totalDelta += Math.abs(samples[i] - samples[i - 1]);
  }
  return totalDelta / (samples.length - 1);
};

const speedtestEndpoints = {
  ping: "https://speed.cloudflare.com/cdn-cgi/trace",
  download: "https://speed.cloudflare.com/__down",
  upload: "https://speed.cloudflare.com/__up",
};

const speedtestUploadFallbacks = [
  "https://speed.cloudflare.com/__up",
  "https://httpbin.org/post",
  "https://postman-echo.com/post",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const measurePing = async () => {
  const samples = [];
  for (let index = 0; index < 4; index += 1) {
    const start = performance.now();
    await fetch(`${speedtestEndpoints.ping}?r=${Date.now()}-${index}`, {
      cache: "no-store",
      mode: "cors",
    });
    samples.push(performance.now() - start);
  }
  const avg = samples.reduce((sum, value) => sum + value, 0) / samples.length;
  return { avg, jitter: calcJitter(samples) };
};

const measureDownload = async () => {
  // Mobile browsers often have limitations with streaming responses (response.body may be null)
  // and large downloads can be killed by the platform. Use a smaller payload on mobile and
  // fall back to arrayBuffer if streaming isn't available.
  const isMobile =
    typeof navigator !== "undefined" &&
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const downloadBytes = isMobile ? 20_000_000 : 200_000_000;
  const minDurationMs = isMobile ? 4000 : 2500;

  const response = await fetch(
    `${speedtestEndpoints.download}?bytes=${downloadBytes}&r=${Date.now()}`,
    {
      cache: "no-store",
      mode: "cors",
    },
  );
  if (!response.ok) {
    throw new Error("Falla en la descarga");
  }

  const start = performance.now();

  // Some browsers (especially on mobile) do not expose a readable stream for cross-origin
  // responses. In that case, fall back to downloading the whole response at once.
  if (!response.body || typeof response.body.getReader !== "function") {
    const data = await response.arrayBuffer();
    const elapsed = Math.max(0.001, (performance.now() - start) / 1000);
    const totalBytes = data.byteLength;
    const mbps = (totalBytes * 8) / elapsed / 1000000;
    setSpeedometer(mbps);
    speedtestDownload.value = `${Math.round(mbps)} Mbps`;

    // Show a more visible download phase on fast connections / small payloads.
    const remaining = minDurationMs - (elapsed * 1000);
    if (remaining > 0) {
      speedtestTime.value = "Estado: procesando resultados";
      await sleep(remaining);
    }

    return mbps;
  }

  const reader = response.body.getReader();
  let totalBytes = 0;
  let completed = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      completed = true;
      break;
    }
    totalBytes += value.byteLength;
    const elapsed = Math.max(0.001, (performance.now() - start) / 1000);
    const mbps = (totalBytes * 8) / elapsed / 1000000;
    setSpeedometer(mbps);
    speedtestDownload.value = `${Math.round(mbps)} Mbps`;
  }
  reader.releaseLock();
  if (!completed) {
    throw new Error("Descarga incompleta");
  }

  const elapsed = Math.max(0.001, (performance.now() - start) / 1000);
  const mbps = (totalBytes * 8) / elapsed / 1000000;

  // Ensure the download step is visible for at least a little while on fast links.
  const remaining = minDurationMs - (elapsed * 1000);
  if (remaining > 0) {
    speedtestTime.value = "Estado: procesando resultados";
    await sleep(remaining);
  }

  return mbps;
};

const measureUpload = async () => {
  const payload = new Blob([new Uint8Array(2_500_000)], {
    type: "application/octet-stream",
  });
  const minDurationMs = 12000;
  setSpeedometer(0);
  for (const endpoint of speedtestUploadFallbacks) {
    try {
      const start = performance.now();
      let uploadedBytes = 0;
      while (performance.now() - start < minDurationMs) {
        await fetch(`${endpoint}?r=${Date.now()}-${uploadedBytes}`, {
          method: "POST",
          mode: "no-cors",
          cache: "no-store",
          body: payload,
        });
        uploadedBytes += payload.size;
        const elapsed = Math.max(0.001, (performance.now() - start) / 1000);
        const mbps = (uploadedBytes * 8) / elapsed / 1000000;
        setSpeedometer(mbps);
        speedtestUpload.value = `${Math.round(mbps)} Mbps`;
        await sleep(140);
      }
      const elapsed = Math.max(0.001, (performance.now() - start) / 1000);
      return (uploadedBytes * 8) / elapsed / 1000000;
    } catch (error) {
      continue;
    }
  }
  throw new Error("Falla en la subida");
};

export const runSpeedtest = async () => {
  if (speedtestIsRunning.value) return;
  speedtestIsRunning.value = true;

  speedtestDownload.value = "0 Mbps";
  speedtestUpload.value = "0 Mbps";
  speedtestPing.value = "-- ms";
  speedtestJitter.value = "-- ms";
  speedtestTime.value = "Estado: iniciando";
  setSpeedometer(0);

  try {
    speedtestTime.value = "Estado: midiendo latencia";
    const latency = await measurePing();
    speedtestPing.value = `${Math.round(latency.avg)} ms`;
    speedtestJitter.value = `${Math.round(latency.jitter)} ms`;

    speedtestTime.value = "Estado: midiendo descarga";
    const downloadStart = performance.now();
    const downloadMbps = await measureDownload();
    const downloadElapsed = performance.now() - downloadStart;
    const minDownloadDisplayMs = 2000;
    if (downloadElapsed < minDownloadDisplayMs) {
      await sleep(minDownloadDisplayMs - downloadElapsed);
    }

    speedtestDownload.value = `${Math.round(downloadMbps)} Mbps`;
    setSpeedometer(downloadMbps);

    speedtestTime.value = "Estado: finalizando descarga";
    await sleep(320);
    speedtestTime.value = "Estado: subida iniciando en 3s";
    setSpeedometer(0);
    await sleep(3000);
    speedtestTime.value = "Estado: midiendo subida";
    let uploadMbps;
    try {
      uploadMbps = await measureUpload();
    } catch (uploadError) {
      uploadMbps = Math.max(1, Math.round(downloadMbps * 0.38));
      speedtestTime.value =
        "Estado: subida estimada por limitación del navegador";
    }
    speedtestUpload.value = `${Math.round(uploadMbps)} Mbps`;

    if (speedtestTime.value.startsWith("Estado: subida estimada")) {
      speedtestTime.value = `${speedtestTime.value} • concluido`;
    } else {
      speedtestTime.value = "Estado: concluido";
    }
  } catch (error) {
    speedtestTime.value = "Estado: servicio no disponible en este momento";
  } finally {
    /* Resetear el velocímetro a 0 suavemente al finalizar */
    setSpeedometer(0);
    await sleep(400);
    speedtestIsRunning.value = false;
  }
};

export const useSpeedtest = () => ({
  speedtestDownload,
  speedtestUpload,
  speedtestPing,
  speedtestJitter,
  speedtestTime,
  runSpeedtest,
  speedtestNeedleAngle,
  speedtestCurrentSpeed,
  speedtestIsRunning,
});
