// Design reminder: Mộc Bản Giang Hồ frames the full-screen pixel map with lacquer-red, bronze, and restrained corner HUD only.

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";
import { assets } from "@/game/assets";

type HudState = { status: string; moving: boolean; wolves: number; hp: number; defeated: number; demo: boolean };

const initialHud: HudState = {
  status: "Đang mở địa đồ Vực Lam…",
  moving: false,
  wolves: 2,
  hp: 100,
  defeated: 0,
  demo: new URLSearchParams(window.location.search).has("demo"),
};

function sendVirtualInput(x: number, y: number, active: boolean) {
  window.dispatchEvent(new CustomEvent("wuxia-input", { detail: { x, y, active } }));
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);
  const touchpadRef = useRef<HTMLDivElement>(null);
  const touchpadActiveRef = useRef(false);
  const [hud, setHud] = useState<HudState>(initialHud);
  const [stick, setStick] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;

    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true });
    let handle: GameHandle | null = null;
    let disposed = false;

    createGameScene(engine, canvas)
      .then((gameHandle) => {
        if (disposed) {
          gameHandle.dispose();
          return;
        }
        handle = gameHandle;
        engine.runRenderLoop(() => gameHandle.scene.render());
      })
      .catch((error) => {
        console.error("Không thể khởi tạo Vực Lam", error);
        setHud((current) => ({ ...current, status: "Không thể mở địa đồ. Hãy làm mới trang." }));
      });

    const onResize = () => engine.resize();
    const onStatus = (event: Event) => {
      const detail = (event as CustomEvent<HudState>).detail;
      if (detail) setHud(detail);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("wuxia-status", onStatus);

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wuxia-status", onStatus);
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  const updateTouchpad = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pad = touchpadRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const radius = rect.width * 0.33;
    let x = (event.clientX - (rect.left + rect.width / 2)) / radius;
    let y = (event.clientY - (rect.top + rect.height / 2)) / radius;
    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    setStick({ x, y });
    sendVirtualInput(x, y, true);
  };

  const onTouchpadDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    touchpadActiveRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateTouchpad(event);
  };

  const onTouchpadEnd = () => {
    touchpadActiveRef.current = false;
    setStick({ x: 0, y: 0 });
    sendVirtualInput(0, 0, false);
  };

  return (
    <main className="game-shell" aria-label="Game Hành Giả: Vực Lam">
      <canvas ref={canvasRef} className="game-canvas" aria-label="Bản đồ Vực Lam; chạm vào điểm trống để dẫn đường" />
      <img className="mist-overlay" src={assets.inkMist} alt="" aria-hidden="true" />

      <section className="hud-layer" aria-live="polite">
        <header className="top-hud">
          <div className="wordmark-panel">
            <span className="seal-logo-frame"><img className="seal-logo" src={assets.sealLogo} alt="Biểu tượng Vực Lam" /></span>
            <div>
              <p className="eyebrow">BẢN ĐỒ VEN HỒ</p>
              <h1>Hành Giả <span>· Vực Lam</span></h1>
            </div>
          </div>
          <div className="status-panel">
            <div className="vitals-row"><span>KHÍ LỰC</span><strong>{hud.hp} / 100</strong></div>
            <div className="vital-track"><span style={{ width: `${hud.hp}%` }} /></div>
            <p>{hud.status}</p>
          </div>
        </header>

        <div className="world-notice"><span className={hud.moving ? "motion-dot active" : "motion-dot"} /> <span>{hud.wolves} sói tuần tra · {hud.defeated} hạ gục</span></div>

        <div className="bottom-hud">
          <div
            ref={touchpadRef}
            className="touchpad"
            role="application"
            aria-label="Touchpad điều khiển"
            onPointerDown={onTouchpadDown}
            onPointerMove={(event) => touchpadActiveRef.current && updateTouchpad(event)}
            onPointerUp={onTouchpadEnd}
            onPointerCancel={onTouchpadEnd}
          >
            <div className="touchpad-ring" />
            <div className="touchpad-core" style={{ transform: `translate(${stick.x * 27}px, ${stick.y * 27}px)` }} />
            <span className="touchpad-label">DẪN LỐI</span>
          </div>

          <p className="control-hint"><kbd>WASD</kbd><kbd>↑↓←→</kbd><span>hoặc chạm vào map</span></p>

          <div className="action-cluster">
            <button
              className="reset-button"
              onClick={() => window.dispatchEvent(new Event("wuxia-reset"))}
              type="button"
            >
              Về lối cũ
            </button>
            <button
              className="action-button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => window.dispatchEvent(new Event("wuxia-action"))}
              type="button"
              aria-label="Vung kiếm"
            >
              <span>KIẾM</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
