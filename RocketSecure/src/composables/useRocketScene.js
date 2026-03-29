import { ref } from "vue";
import rocketTemplateMarkup from "../assets/rocket-template.html?raw";

let rocketTemplateDocument = null;
let rocketResizeObserver = null;

export const loadRocketTemplate = async () => {
  if (rocketTemplateDocument) {
    return rocketTemplateDocument;
  }
  const parseTemplate = (markup) =>
    new DOMParser().parseFromString(markup, "text/html");
  rocketTemplateDocument = parseTemplate(rocketTemplateMarkup);
  return rocketTemplateDocument;
};

export const mountRocketScene = async (rocketHost) => {
  if (!rocketHost) {
    return null;
  }
  const templateDocument = await loadRocketTemplate();
  const templateStyle =
    templateDocument.querySelector("style")?.textContent ?? "";
  const templateArtboard = templateDocument.querySelector(".artboard");
  if (!templateArtboard) {
    return null;
  }
  const shadowRoot =
    rocketHost.shadowRoot ?? rocketHost.attachShadow({ mode: "open" });
  const styleElement = document.createElement("style");
  styleElement.textContent = `
        :host {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
        }
        .rocket-root {
          position: relative;
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
        }
        .rocket-stage {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 300px;
          height: 300px;
          transform-origin: center center;
        }
        ${templateStyle}
        .artboard {
          border: 0 !important;
          background: radial-gradient(circle at bottom, rgba(109, 169, 255, 0.28) 0%, rgba(11, 16, 32, 0) 62%) !important;
        }
        #rocket .st0 {
          fill: #7eb4ff !important;
        }
        .takeoff {
          background-image: linear-gradient(to right, #6da9ff 0%, #b6d5ff 26%, #73b4ff 50%, #b6d5ff 74%, #6da9ff 100%) !important;
        }
        .fire {
          background-color: #7ec4ff !important;
        }
        .fire:after {
          background-color: #e2f0ff !important;
        }
        @keyframes flicker {
          0% {
            transform: rotate(135deg) scale(0.8);
            box-shadow: 0 0 17px 10px rgba(126, 196, 255, 0.52);
          }
          25% {
            box-shadow: 0 0 17px 5px rgba(126, 196, 255, 0.52);
          }
          50% {
            box-shadow: 0 0 17px 7px rgba(126, 196, 255, 0.52);
          }
          75% {
            box-shadow: 0 0 17px 5px rgba(126, 196, 255, 0.52);
          }
          100% {
            box-shadow: 0 0 17px 10px rgba(126, 196, 255, 0.52);
          }
        }
        .artboard {
          margin: 0 !important;
          margin-top: 0 !important;
        }
      `;
  const rocketStage = document.createElement("div");
  rocketStage.className = "rocket-stage";
  rocketStage.appendChild(templateArtboard.cloneNode(true));
  const rocketRoot = document.createElement("div");
  rocketRoot.className = "rocket-root";
  rocketRoot.appendChild(rocketStage);
  shadowRoot.replaceChildren(styleElement, rocketRoot);
  syncRocketScale(shadowRoot);
  applyFlameMode(shadowRoot, "idle");
  return shadowRoot;
};

export const syncRocketScale = (shadowRoot) => {
  if (!shadowRoot) {
    return;
  }
  const rocketStage = shadowRoot.querySelector(".rocket-stage");
  if (!rocketStage) {
    return;
  }
  const rocketHost = shadowRoot.host;
  const hostSize = Math.min(
    rocketHost.clientWidth,
    rocketHost.clientHeight,
  );
  const nextScale = hostSize > 0 ? hostSize / 300 : 1;
  rocketStage.style.transform = `translate(-50%, -50%) scale(${nextScale})`;
};

export const observeRocketScale = (rocketHost, shadowRoot) => {
  if (!rocketHost || !shadowRoot) {
    return;
  }
  if (!rocketResizeObserver) {
    rocketResizeObserver = new ResizeObserver(() => {
      syncRocketScale(shadowRoot);
    });
  }
  rocketResizeObserver.disconnect();
  rocketResizeObserver.observe(rocketHost);
};

export const applyFlameMode = (shadowRoot, mode) => {
  if (!shadowRoot) {
    return;
  }
  const fire = shadowRoot.querySelector(".fire");
  const takeoff = shadowRoot.querySelector(".takeoff");
  if (!fire || !takeoff) {
    return;
  }
  if (window.TweenMax) {
    TweenMax.set(fire, { opacity: 1 });
    TweenMax.set(takeoff, { opacity: 0, y: 0, scaleY: 1 });
    return;
  }
  fire.style.opacity = "1";
  takeoff.style.opacity = "0";
  takeoff.style.transform = "translateX(-50%)";
};

export const animateRocketLaunch = async (rocketHost) => {
  const shadowRoot = await mountRocketScene(rocketHost);
  if (!shadowRoot) {
    return;
  }
  const rocket = shadowRoot.querySelector("#rocket");
  const takeoff = shadowRoot.querySelector(".takeoff");
  const fire = shadowRoot.querySelector(".fire");
  const smoke = shadowRoot.querySelector(".smoke");
  const stars = shadowRoot.querySelector(".stars");
  const stars2 = shadowRoot.querySelector(".stars2");
  const artboard = shadowRoot.querySelector(".artboard");
  if (
    !rocket ||
    !takeoff ||
    !fire ||
    !smoke ||
    !stars ||
    !stars2 ||
    !artboard
  ) {
    return;
  }
  if (!window.TimelineMax || !window.TweenMax || !window.Expo) {
    return;
  }
  const tl = new TimelineMax({});
  tl.timeScale(1.25);
  applyFlameMode(shadowRoot, "launching");
  tl.addLabel("start", 0)
    .add(
      TweenMax.from(takeoff, 0.5, {
        scaleY: 0,
        y: -200,
        ease: Expo.easeInOut,
        delay: 3,
      }),
    )
    .add(TweenMax.to(fire, 0.18, { opacity: 0 }), 3)
    .add(TweenMax.to(takeoff, 0.1, { opacity: 1 }), 3)
    .add(TweenMax.to(rocket, 1, { className: "+=shake", delay: -1 }))
    .add(TweenMax.to(smoke, 2, { y: -50, delay: 1 }))
    .add(TweenMax.to(rocket, 1, { className: "-=shake" }))
    .add(TweenMax.to(rocket, 1, { y: -300, delay: -1 }))
    .add(TweenMax.to(takeoff, 1, { y: -300, delay: -1 }))
    .add(TweenMax.to(smoke, 5, { scale: 1, y: -20, delay: -1 }))
    .add(TweenMax.to(rocket, 1, { y: -10, rotate: 40, delay: -3 }))
    .add(TweenMax.to(takeoff, 0.2, { opacity: 0, delay: -3 }))
    .add(TweenMax.to(fire, 0.12, { opacity: 1, delay: -3 }))
    .add(TweenMax.to(stars, 0.2, { opacity: 0, delay: -3 }))
    .add(TweenMax.from(stars2, 0.2, { opacity: 0, delay: -3 }))
    .add(TweenMax.to(artboard, 0.2, { rotation: 40, delay: -3 }))
    .add(TweenMax.to(smoke, 2, { opacity: 0, delay: -2 }));
  tl.eventCallback("onComplete", () => {
    applyFlameMode(shadowRoot, "idle");
  });
};
