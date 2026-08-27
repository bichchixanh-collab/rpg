// Design reminder: Inputs must feel as immediate as an arcade J2ME d-pad—one semantic movement vector regardless of device.

export type Vector2 = { x: number; y: number };

type VirtualInputDetail = Vector2 & { active: boolean };

const zero: Vector2 = { x: 0, y: 0 };

function normalize(vector: Vector2): Vector2 {
  const length = Math.hypot(vector.x, vector.y);
  return length > 0.001 ? { x: vector.x / length, y: vector.y / length } : zero;
}

export class InputManager {
  private readonly keys = new Set<string>();
  private virtual: VirtualInputDetail = { x: 0, y: 0, active: false };
  private target: Vector2 | null = null;

  private readonly onKeyDown = (event: KeyboardEvent) => {
    const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"];
    if (keys.includes(event.key)) {
      this.keys.add(event.key.toLowerCase());
      event.preventDefault();
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent) => {
    this.keys.delete(event.key.toLowerCase());
  };

  private readonly onVirtualInput = (event: Event) => {
    const detail = (event as CustomEvent<VirtualInputDetail>).detail;
    if (!detail) return;
    this.virtual = detail;
    if (detail.active) this.target = null;
  };

  private readonly onCanvasPointer = (event: PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const rect = this.canvas.getBoundingClientRect();
    this.target = this.screenToWorld(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height);
    this.virtual = { x: 0, y: 0, active: false };
  };

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly screenToWorld: (x: number, y: number, width: number, height: number) => Vector2,
  ) {
    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("wuxia-input", this.onVirtualInput);
    canvas.addEventListener("pointerdown", this.onCanvasPointer);
  }

  public movementFrom(position: Vector2): Vector2 {
    const keyboard: Vector2 = {
      x: Number(this.keys.has("arrowright") || this.keys.has("d")) - Number(this.keys.has("arrowleft") || this.keys.has("a")),
      y: Number(this.keys.has("arrowdown") || this.keys.has("s")) - Number(this.keys.has("arrowup") || this.keys.has("w")),
    };

    if (keyboard.x !== 0 || keyboard.y !== 0) {
      this.target = null;
      return normalize(keyboard);
    }

    if (this.virtual.active && Math.hypot(this.virtual.x, this.virtual.y) > 0.12) {
      return normalize(this.virtual);
    }

    if (!this.target) return zero;
    const delta = { x: this.target.x - position.x, y: this.target.y - position.y };
    if (Math.hypot(delta.x, delta.y) < 18) {
      this.target = null;
      return zero;
    }
    return normalize(delta);
  }

  public getTarget(): Vector2 | null {
    return this.target;
  }

  public dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("wuxia-input", this.onVirtualInput);
    this.canvas.removeEventListener("pointerdown", this.onCanvasPointer);
  }
}
