// Design reminder: Mộc Bản Giang Hồ is a legible top-down mobile RPG—quiet grass, tile-built paths, clear silhouettes, lacquer-red feedback.

import type { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { assets } from "./assets";
import { InputManager, type Vector2 } from "./InputManager";

const VIEW_WIDTH = 1600;
const VIEW_HEIGHT = 900;
const WORLD_WIDTH = 2368;
const WORLD_HEIGHT = 1696;
const TILE = 128;

type Direction = "down" | "right" | "up" | "left";
type SpriteImage = HTMLCanvasElement;

type PlayerState = {
  x: number;
  y: number;
  direction: Direction;
  moving: boolean;
  attack: number;
  hp: number;
  hurt: number;
};

type AnimalState = {
  kind: "wolf" | "rabbit";
  x: number;
  y: number;
  direction: Direction;
  route: Vector2[];
  routeIndex: number;
  speed: number;
  phase: number;
  action: number;
  home: Vector2;
  hp: number;
  maxHp: number;
  hurt: number;
  flee: number;
  respawn: number;
};

type Rect = { x: number; y: number; width: number; height: number };

const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum);
const distance = (a: Vector2, b: Vector2) => Math.hypot(a.x - b.x, a.y - b.y);

function directionFrom(vector: Vector2, fallback: Direction): Direction {
  if (Math.abs(vector.x) < 0.01 && Math.abs(vector.y) < 0.01) return fallback;
  if (Math.abs(vector.x) > Math.abs(vector.y)) return vector.x > 0 ? "right" : "left";
  return vector.y > 0 ? "down" : "up";
}

function vectorFromDirection(direction: Direction): Vector2 {
  const vectors: Record<Direction, Vector2> = {
    down: { x: 0, y: 1 },
    right: { x: 1, y: 0 },
    up: { x: 0, y: -1 },
    left: { x: -1, y: 0 },
  };
  return vectors[direction];
}

function normalize(vector: Vector2): Vector2 {
  const length = Math.hypot(vector.x, vector.y);
  return length > 0.001 ? { x: vector.x / length, y: vector.y / length } : { x: 0, y: 0 };
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Không thể tải asset: ${source}`));
    image.src = source;
  });
}

function stripAtlasBackdrop(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return canvas;

  context.imageSmoothingEnabled = false;
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const visited = new Uint8Array(canvas.width * canvas.height);
  const stack: number[] = [];

  const isBackdrop = (offset: number) => {
    const r = pixels.data[offset];
    const g = pixels.data[offset + 1];
    const b = pixels.data[offset + 2];
    return r > 212 && g > 212 && b > 212 && Math.max(r, g, b) - Math.min(r, g, b) < 24;
  };
  const enqueue = (x: number, y: number) => {
    const index = y * canvas.width + x;
    if (visited[index] || !isBackdrop(index * 4)) return;
    visited[index] = 1;
    stack.push(index);
  };

  for (let x = 0; x < canvas.width; x += 1) {
    enqueue(x, 0);
    enqueue(x, canvas.height - 1);
  }
  for (let y = 0; y < canvas.height; y += 1) {
    enqueue(0, y);
    enqueue(canvas.width - 1, y);
  }

  while (stack.length) {
    const index = stack.pop()!;
    pixels.data[index * 4 + 3] = 0;
    const x = index % canvas.width;
    const y = Math.floor(index / canvas.width);
    if (x > 0) enqueue(x - 1, y);
    if (x < canvas.width - 1) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y < canvas.height - 1) enqueue(x, y + 1);
  }

  context.putImageData(pixels, 0, 0);
  return canvas;
}

export class GameWorld {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly input: InputManager;
  private player: PlayerState = { x: 1120, y: 760, direction: "up", moving: false, attack: 0, hp: 100, hurt: 0 };
  private animals: AnimalState[] = [
    {
      kind: "wolf",
      x: 1530,
      y: 1040,
      direction: "left",
      speed: 84,
      phase: 0,
      action: 0,
      home: { x: 1530, y: 1040 },
      hp: 3,
      maxHp: 3,
      hurt: 0,
      flee: 0,
      respawn: 0,
      routeIndex: 0,
      route: [
        { x: 1450, y: 1040 },
        { x: 1850, y: 1040 },
        { x: 1850, y: 1360 },
        { x: 1400, y: 1360 },
      ],
    },
    {
      kind: "wolf",
      x: 660,
      y: 1280,
      direction: "right",
      speed: 72,
      phase: 1.8,
      action: 0,
      home: { x: 660, y: 1280 },
      hp: 3,
      maxHp: 3,
      hurt: 0,
      flee: 0,
      respawn: 0,
      routeIndex: 0,
      route: [
        { x: 660, y: 1190 },
        { x: 930, y: 1190 },
        { x: 930, y: 1440 },
        { x: 500, y: 1440 },
      ],
    },
    {
      kind: "rabbit",
      x: 1120,
      y: 670,
      direction: "left",
      speed: 46,
      phase: 0.8,
      action: 0,
      home: { x: 1120, y: 670 },
      hp: 1,
      maxHp: 1,
      hurt: 0,
      flee: 0,
      respawn: 0,
      routeIndex: 0,
      route: [
        { x: 1120, y: 670 },
        { x: 980, y: 720 },
        { x: 1080, y: 790 },
        { x: 1220, y: 740 },
      ],
    },
  ];
  private images: { player: SpriteImage; tilemap: SpriteImage; animals: SpriteImage } | null = null;
  private elapsed = 0;
  private hudPulse = 0;
  private demoIndex = 0;
  private defeatedWolves = 0;
  private combatMessage = "";
  private combatMessageTimer = 0;
  private readonly attackHitTargets = new Set<number>();
  private readonly contactCooldowns = new Map<AnimalState, number>();
  private readonly demoMode = new URLSearchParams(window.location.search).has("demo");

  private readonly obstacles: Rect[] = [
    { x: 310, y: 420, width: 510, height: 372 },
    { x: 120, y: 940, width: 140, height: 150 },
    { x: 900, y: 540, width: 124, height: 154 },
    { x: 1880, y: 1150, width: 134, height: 150 },
    { x: 1120, y: 1320, width: 136, height: 146 },
  ];

  private readonly demoRoute: Vector2[] = [
    { x: 1340, y: 820 },
    { x: 1300, y: 1060 },
    { x: 980, y: 1100 },
    { x: 760, y: 900 },
    { x: 930, y: 700 },
  ];

  private readonly onAction = () => {
    if (this.player.attack > 0 || this.player.hp <= 0) return;
    this.player.attack = 0.48;
    this.attackHitTargets.clear();
    this.setCombatMessage("Lưỡi kiếm quét một vệt đỏ son.", 0.5);
  };

  private readonly onReset = () => {
    this.player = { x: 1120, y: 760, direction: "up", moving: false, attack: 0, hp: 100, hurt: 0 };
    this.animals.forEach((animal) => {
      animal.x = animal.home.x;
      animal.y = animal.home.y;
      animal.hp = animal.maxHp;
      animal.hurt = 0;
      animal.flee = 0;
      animal.respawn = 0;
      animal.routeIndex = 0;
    });
    this.defeatedWolves = 0;
    this.contactCooldowns.clear();
    this.demoIndex = 0;
    this.setCombatMessage("Đường mòn trở lại bình yên.", 0.8);
  };

  public constructor(
    canvas: HTMLCanvasElement,
    private readonly texture: DynamicTexture,
  ) {
    const context = texture.getContext();
    if (!context) throw new Error("Không tạo được canvas texture cho game.");
    this.ctx = context as unknown as CanvasRenderingContext2D;
    this.ctx.imageSmoothingEnabled = false;
    this.input = new InputManager(canvas, (x, y, width, height) => this.screenToWorld(x, y, width, height));
    window.addEventListener("wuxia-action", this.onAction);
    window.addEventListener("wuxia-reset", this.onReset);
  }

  public async load() {
    const [player, tilemap, animals] = await Promise.all([loadImage(assets.player), loadImage(assets.tilemap), loadImage(assets.animals)]);
    this.images = {
      player: stripAtlasBackdrop(player),
      tilemap: stripAtlasBackdrop(tilemap),
      animals: stripAtlasBackdrop(animals),
    };
    this.emitHud("Chạm vào đất trống để chọn đường đi.");
  }

  public update(delta: number) {
    this.elapsed += Math.min(delta, 0.05);
    this.player.hurt = Math.max(0, this.player.hurt - delta);
    this.combatMessageTimer = Math.max(0, this.combatMessageTimer - delta);
    if (this.combatMessageTimer === 0) this.combatMessage = "";

    let desired = this.demoMode ? this.demoMovement() : this.input.movementFrom(this.player);
    if (this.demoMode && this.player.attack === 0) {
      const target = this.animals.find((animal) => animal.kind === "wolf" && animal.respawn === 0 && distance(this.player, animal) < 132);
      if (target) {
        this.player.direction = directionFrom({ x: target.x - this.player.x, y: target.y - this.player.y }, this.player.direction);
        desired = { x: 0, y: 0 };
        this.onAction();
      }
    }
    const speed = this.player.attack > 0 || this.player.hp <= 0 ? 0 : 224;
    this.player.moving = Math.hypot(desired.x, desired.y) > 0.001;

    if (this.player.moving && this.player.hp > 0) {
      this.player.direction = directionFrom(desired, this.player.direction);
      this.movePlayer(desired.x * speed * delta, desired.y * speed * delta);
    }
    this.player.attack = Math.max(0, this.player.attack - delta);
    if (this.player.attack > 0) this.resolveSwordHits();

    for (const animal of this.animals) this.updateAnimal(animal, delta);
    this.resolveBodyCollisions();

    this.hudPulse += delta;
    if (this.hudPulse > 0.16) {
      this.hudPulse = 0;
      const nearestWolf = Math.min(...this.animals.filter((animal) => animal.kind === "wolf").map((wolf) => distance(this.player, wolf)));
      const status = this.player.hp <= 0
        ? "Khí lực đã cạn — chọn “Về lối cũ” để hồi phục."
        : this.combatMessage || (this.demoMode ? "Trình diễn đường tuần tra và tấn công." : nearestWolf < 260 ? "Sói xám đang rảo bước rất gần." : this.player.moving ? "Dấu chân lướt qua lối gạch đỏ." : "Gió nhẹ lay cỏ bên hồ.");
      this.emitHud(status);
    }
  }

  public render() {
    this.ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    if (!this.images) {
      this.ctx.fillStyle = "#18392f";
      this.ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
      this.ctx.fillStyle = "#e8d4a3";
      this.ctx.font = "600 30px serif";
      this.ctx.fillText("Đang mở bản đồ Vực Lam…", 600, 450);
      this.texture.update();
      return;
    }

    this.ctx.fillStyle = "#315d36";
    this.ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    this.ctx.save();
    this.ctx.translate(VIEW_WIDTH / 2 - this.player.x, VIEW_HEIGHT / 2 - this.player.y);
    this.drawGround();
    this.drawMapFeatures();
    this.drawWoodblockMarks();
    this.drawTargetSeal();
    this.drawAnimals();
    this.drawPlayer();
    this.drawSwordArc();
    this.drawForeground();
    this.ctx.restore();
    this.drawVignette();
    this.texture.update();
  }

  public dispose() {
    this.input.dispose();
    window.removeEventListener("wuxia-action", this.onAction);
    window.removeEventListener("wuxia-reset", this.onReset);
  }

  private emitHud(status: string) {
    window.dispatchEvent(
      new CustomEvent("wuxia-status", {
        detail: {
          status,
          moving: this.player.moving,
          wolves: this.animals.filter((animal) => animal.kind === "wolf" && animal.respawn === 0).length,
          hp: this.player.hp,
          defeated: this.defeatedWolves,
          demo: this.demoMode,
        },
      }),
    );
  }

  private screenToWorld(x: number, y: number, width: number, height: number): Vector2 {
    return {
      x: clamp(this.player.x + (x / width - 0.5) * VIEW_WIDTH, 60, WORLD_WIDTH - 60),
      y: clamp(this.player.y + (y / height - 0.5) * VIEW_HEIGHT, 60, WORLD_HEIGHT - 60),
    };
  }

  private demoMovement(): Vector2 {
    const target = this.demoRoute[this.demoIndex];
    const delta = { x: target.x - this.player.x, y: target.y - this.player.y };
    if (Math.hypot(delta.x, delta.y) < 24) {
      this.demoIndex = (this.demoIndex + 1) % this.demoRoute.length;
      return { x: 0, y: 0 };
    }
    const length = Math.hypot(delta.x, delta.y);
    return { x: delta.x / length, y: delta.y / length };
  }

  private movePlayer(dx: number, dy: number) {
    const nextX = this.player.x + dx;
    if (!this.collides(nextX, this.player.y, 32)) this.player.x = nextX;
    const nextY = this.player.y + dy;
    if (!this.collides(this.player.x, nextY, 32)) this.player.y = nextY;
  }

  private updateAnimal(animal: AnimalState, delta: number) {
    if (animal.respawn > 0) {
      animal.respawn = Math.max(0, animal.respawn - delta);
      if (animal.respawn === 0) this.reviveAnimal(animal);
      return;
    }

    animal.phase += delta;
    animal.hurt = Math.max(0, animal.hurt - delta);
    animal.action = Math.max(0, animal.action - delta);
    animal.flee = Math.max(0, animal.flee - delta);
    const cooldown = Math.max(0, (this.contactCooldowns.get(animal) ?? 0) - delta);
    if (cooldown > 0) this.contactCooldowns.set(animal, cooldown);
    else this.contactCooldowns.delete(animal);

    const fromPlayer = { x: animal.x - this.player.x, y: animal.y - this.player.y };
    const playerDistance = Math.hypot(fromPlayer.x, fromPlayer.y);
    if (animal.kind === "rabbit" && animal.flee > 0) {
      const away = normalize(fromPlayer);
      animal.direction = directionFrom(away, animal.direction);
      this.moveAnimal(animal, away, animal.speed * 3.4, delta);
      return;
    }

    if (animal.kind === "wolf" && this.player.hp > 0 && playerDistance < 255 && animal.hurt === 0) {
      const chase = normalize({ x: this.player.x - animal.x, y: this.player.y - animal.y });
      animal.direction = directionFrom(chase, animal.direction);
      if (playerDistance > 82) this.moveAnimal(animal, chase, animal.speed * 1.55, delta);
      else animal.action = Math.max(animal.action, 0.16);
      return;
    }

    const target = animal.route[animal.routeIndex];
    const deltaToTarget = { x: target.x - animal.x, y: target.y - animal.y };
    const length = Math.hypot(deltaToTarget.x, deltaToTarget.y);
    if (length < 12) {
      animal.routeIndex = (animal.routeIndex + 1) % animal.route.length;
      if (animal.kind === "wolf") animal.action = 0.25;
      return;
    }

    const direction = normalize(deltaToTarget);
    animal.direction = directionFrom(direction, animal.direction);
    this.moveAnimal(animal, direction, animal.speed, delta);
  }

  private moveAnimal(animal: AnimalState, direction: Vector2, speed: number, delta: number) {
    const radius = animal.kind === "wolf" ? 24 : 14;
    const next = { x: animal.x + direction.x * speed * delta, y: animal.y + direction.y * speed * delta };
    if (!this.collides(next.x, next.y, radius)) {
      animal.x = next.x;
      animal.y = next.y;
    } else {
      animal.routeIndex = (animal.routeIndex + 1) % animal.route.length;
    }
  }

  private resolveSwordHits() {
    if (this.player.attack > 0.36 || this.player.attack < 0.06) return;
    const swordFacing = vectorFromDirection(this.player.direction);
    const strikeCenter = { x: this.player.x + swordFacing.x * 98, y: this.player.y + swordFacing.y * 98 };

    this.animals.forEach((animal, index) => {
      if (animal.respawn > 0 || this.attackHitTargets.has(index)) return;
      const hitRadius = animal.kind === "wolf" ? 84 : 72;
      if (distance(strikeCenter, animal) > hitRadius) return;

      this.attackHitTargets.add(index);
      const knockback = normalize({ x: animal.x - this.player.x, y: animal.y - this.player.y });
      animal.x += knockback.x * 38;
      animal.y += knockback.y * 38;
      animal.hurt = 0.32;

      if (animal.kind === "wolf") {
        animal.hp -= 1;
        animal.action = 0.38;
        if (animal.hp <= 0) {
          animal.respawn = 5.2;
          this.defeatedWolves += 1;
          this.setCombatMessage("Sói xám lùi vào bóng cỏ. +1 chiến tích", 1.4);
        } else {
          this.setCombatMessage(`Đòn trúng đích — sói còn ${animal.hp}/${animal.maxHp} khí lực.`, 1.1);
        }
      } else {
        animal.flee = 1.7;
        this.setCombatMessage("Thỏ trắng giật mình, phóng vút vào bụi cỏ.", 1.1);
      }
    });
  }

  private resolveBodyCollisions() {
    for (const animal of this.animals) {
      if (animal.respawn > 0) continue;
      const minimumDistance = animal.kind === "wolf" ? 70 : 56;
      const delta = { x: this.player.x - animal.x, y: this.player.y - animal.y };
      const length = Math.hypot(delta.x, delta.y);
      if (length >= minimumDistance) continue;

      const normal = length > 0.01 ? { x: delta.x / length, y: delta.y / length } : vectorFromDirection(this.player.direction);
      const overlap = minimumDistance - length;
      const playerNext = { x: this.player.x + normal.x * overlap * 0.58, y: this.player.y + normal.y * overlap * 0.58 };
      const animalNext = { x: animal.x - normal.x * overlap * 0.42, y: animal.y - normal.y * overlap * 0.42 };
      if (!this.collides(playerNext.x, playerNext.y, 32)) {
        this.player.x = playerNext.x;
        this.player.y = playerNext.y;
      }
      if (!this.collides(animalNext.x, animalNext.y, animal.kind === "wolf" ? 24 : 14)) {
        animal.x = animalNext.x;
        animal.y = animalNext.y;
      }

      if (animal.kind === "wolf" && animal.hurt === 0 && this.player.hurt === 0 && (this.contactCooldowns.get(animal) ?? 0) === 0) {
        this.player.hp = Math.max(0, this.player.hp - 8);
        this.player.hurt = 0.48;
        animal.action = 0.32;
        this.contactCooldowns.set(animal, 1.05);
        this.setCombatMessage(this.player.hp > 0 ? "Sói cào trúng! Khí lực -8." : "Bạn đã kiệt sức giữa lối gạch.", 1.2);
      }
    }
  }

  private reviveAnimal(animal: AnimalState) {
    animal.x = animal.home.x;
    animal.y = animal.home.y;
    animal.hp = animal.maxHp;
    animal.hurt = 0;
    animal.action = 0;
    animal.flee = 0;
    animal.routeIndex = 0;
    this.contactCooldowns.delete(animal);
    this.setCombatMessage("Một bóng sói khác lặng lẽ xuất hiện ở ven rừng.", 1.1);
  }

  private setCombatMessage(message: string, duration: number) {
    this.combatMessage = message;
    this.combatMessageTimer = duration;
  }

  private collides(x: number, y: number, radius: number) {
    if (x < radius || y < radius || x > WORLD_WIDTH - radius || y > WORLD_HEIGHT - radius) return true;
    const pondX = (x - 1615) / 305;
    const pondY = (y - 590) / 244;
    if (pondX * pondX + pondY * pondY < 1) return true;
    return this.obstacles.some((rect) => x + radius > rect.x && x - radius < rect.x + rect.width && y + radius > rect.y && y - radius < rect.y + rect.height);
  }

  private drawGround() {
    this.ctx.fillStyle = "#4f7a3c";
    this.ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.ctx.fillStyle = "#477137";
    for (let y = 20; y < WORLD_HEIGHT; y += 46) {
      for (let x = (y / 46) % 2 === 0 ? 16 : 38; x < WORLD_WIDTH; x += 64) {
        this.ctx.fillRect(x, y, 3, 8);
        this.ctx.fillRect(x + 5, y + 4, 7, 3);
      }
    }
    this.ctx.fillStyle = "#3a6634";
    for (let index = 0; index < 128; index += 1) {
      const x = (index * 151) % WORLD_WIDTH;
      const y = (index * 277) % WORLD_HEIGHT;
      this.ctx.fillRect(x, y, 5, 3);
    }

    this.drawBrickPath(0, 870, WORLD_WIDTH, 172);
    this.drawBrickPath(720, 620, 216, 610);
    this.drawBrickPath(900, 730, 710, 144);
    this.drawPond();
  }

  private drawBrickPath(x: number, y: number, width: number, height: number) {
    this.ctx.fillStyle = "#9d5634";
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeStyle = "#633427";
    this.ctx.lineWidth = 4;
    for (let row = 0; row <= height; row += 28) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + row);
      this.ctx.lineTo(x + width, y + row);
      this.ctx.stroke();
    }
    for (let row = 0; row < height; row += 28) {
      const shift = (Math.floor(row / 28) % 2) * 32;
      for (let col = -32 + shift; col < width; col += 64) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + col, y + row);
        this.ctx.lineTo(x + col, y + row + 28);
        this.ctx.stroke();
      }
    }
    this.ctx.strokeStyle = "rgba(231, 171, 94, 0.42)";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x + 3, y + 3, width - 6, height - 6);
  }

  private drawPond() {
    const pondX = 1615;
    const pondY = 590;
    this.ctx.fillStyle = "#2c747b";
    this.ctx.beginPath();
    this.ctx.ellipse(pondX, pondY, 310, 250, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = "#3d4633";
    this.ctx.lineWidth = 22;
    this.ctx.stroke();
    this.ctx.strokeStyle = "#a08451";
    this.ctx.lineWidth = 6;
    this.ctx.stroke();
    this.ctx.strokeStyle = "rgba(181, 227, 215, 0.65)";
    this.ctx.lineWidth = 5;
    for (let row = 0; row < 5; row += 1) {
      const y = pondY - 130 + row * 58;
      const half = 160 + (row % 2) * 32;
      this.ctx.beginPath();
      this.ctx.moveTo(pondX - half, y);
      this.ctx.lineTo(pondX - half + 64, y);
      this.ctx.moveTo(pondX + half - 60, y + 12);
      this.ctx.lineTo(pondX + half, y + 12);
      this.ctx.stroke();
    }
  }

  private tiledRect(x: number, y: number, width: number, height: number, sx: number, sy: number, sw: number, sh: number) {
    const { tilemap } = this.images!;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    this.ctx.clip();
    for (let tileY = y; tileY < y + height; tileY += TILE) {
      for (let tileX = x; tileX < x + width; tileX += TILE) {
        this.ctx.drawImage(tilemap, sx, sy, sw, sh, tileX, tileY, TILE, TILE);
      }
    }
    this.ctx.restore();
  }

  private drawMapFeatures() {
    const { tilemap } = this.images!;
    this.ctx.drawImage(tilemap, 1910, 830, 640, 520, 300, 370, 525, 432);
    this.ctx.drawImage(tilemap, 18, 500, 335, 315, 92, 900, 205, 194);
    this.ctx.drawImage(tilemap, 344, 500, 270, 315, 890, 505, 184, 204);
    this.ctx.drawImage(tilemap, 20, 500, 335, 315, 1880, 1136, 202, 190);
    this.ctx.drawImage(tilemap, 1655, 500, 252, 315, 1100, 1300, 164, 204);
    this.ctx.drawImage(tilemap, 1940, 500, 218, 315, 1880, 1120, 142, 205);

    this.ctx.fillStyle = "rgba(16, 43, 29, 0.22)";
    for (let index = 0; index < 24; index += 1) {
      const x = (index * 193) % (WORLD_WIDTH - 80) + 36;
      const y = (index * 311) % (WORLD_HEIGHT - 80) + 30;
      this.ctx.fillRect(x, y, 4, 4);
    }
  }

  private drawWoodblockMarks() {
    const marks = [
      { x: 940, y: 506, scale: 1 },
      { x: 1230, y: 485, scale: 0.74 },
      { x: 1290, y: 270, scale: 0.82 },
      { x: 1990, y: 720, scale: 0.92 },
      { x: 420, y: 1080, scale: 0.7 },
      { x: 1460, y: 1430, scale: 0.72 },
    ];
    this.ctx.save();
    this.ctx.strokeStyle = "rgba(39, 77, 50, 0.62)";
    this.ctx.lineWidth = 4;
    for (const mark of marks) {
      const { x, y, scale } = mark;
      this.ctx.beginPath();
      this.ctx.arc(x - 18 * scale, y, 18 * scale, Math.PI * 0.1, Math.PI * 1.1);
      this.ctx.arc(x + 6 * scale, y + 5 * scale, 16 * scale, Math.PI * 1.05, Math.PI * 1.95);
      this.ctx.arc(x + 25 * scale, y - 4 * scale, 11 * scale, Math.PI * 1.1, Math.PI * 1.85);
      this.ctx.stroke();
      this.ctx.fillStyle = "rgba(171, 143, 79, 0.28)";
      this.ctx.fillRect(x - 42 * scale, y + 21 * scale, 68 * scale, 3 * scale);
    }
    this.ctx.restore();
  }

  private drawTargetSeal() {
    const target = this.input.getTarget();
    if (!target) return;
    const pulse = 1 + Math.sin(this.elapsed * 8) * 0.08;
    this.ctx.save();
    this.ctx.translate(target.x, target.y);
    this.ctx.rotate(Math.PI / 4);
    this.ctx.scale(pulse, pulse);
    this.ctx.strokeStyle = "rgba(236, 205, 126, 0.9)";
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(-19, -19, 38, 38);
    this.ctx.strokeStyle = "rgba(144, 37, 29, 0.92)";
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(-12, -12, 24, 24);
    this.ctx.restore();
  }

  private drawAnimals() {
    for (const animal of [...this.animals].filter((animal) => animal.respawn === 0).sort((a, b) => a.y - b.y)) this.drawAnimal(animal);
  }

  private drawAnimal(animal: AnimalState) {
    const { animals } = this.images!;
    const directionIndex: Record<Direction, number> = { down: 0, right: 1, up: 2, left: 3 };
    const sourceX = (animal.kind === "wolf" ? 1280 : 0) + directionIndex[animal.direction] * 320;
    const row = animal.kind === "wolf" && animal.action > 0 ? 2 : 1;
    const sourceY = row * 480;
    const size = animal.kind === "wolf" ? { width: 138, height: 138 } : { width: 96, height: 96 };
    const hop = animal.kind === "rabbit" ? Math.abs(Math.sin(animal.phase * 5)) * 12 : 0;

    this.ctx.save();
    this.ctx.globalAlpha = 0.25;
    this.ctx.fillStyle = "#19271d";
    this.ctx.beginPath();
    this.ctx.ellipse(animal.x, animal.y + 26, size.width * 0.3, 11, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
    this.ctx.save();
    if (animal.hurt > 0 && Math.floor(this.elapsed * 20) % 2 === 0) this.ctx.globalAlpha = 0.56;
    this.ctx.drawImage(animals, sourceX, sourceY, 320, 480, animal.x - size.width / 2, animal.y - size.height + 30 - hop, size.width, size.height);
    this.ctx.restore();

    if (animal.kind === "wolf") {
      const width = 54;
      const barY = animal.y - size.height + 10;
      this.ctx.fillStyle = "rgba(22, 17, 13, 0.78)";
      this.ctx.fillRect(animal.x - width / 2 - 2, barY - 2, width + 4, 8);
      this.ctx.fillStyle = "#743127";
      this.ctx.fillRect(animal.x - width / 2, barY, width, 4);
      this.ctx.fillStyle = "#d6b05d";
      this.ctx.fillRect(animal.x - width / 2, barY, width * (animal.hp / animal.maxHp), 4);
    }

    if (animal.kind === "rabbit" && animal.flee > 0) {
      this.ctx.fillStyle = "#b33e2d";
      this.ctx.fillRect(animal.x + 34, animal.y - size.height + 6, 5, 12);
      this.ctx.fillRect(animal.x + 34, animal.y - size.height + 22, 5, 5);
    }
  }

  private drawPlayer() {
    const { player } = this.images!;
    const directionIndex: Record<Direction, number> = { down: 0, right: 1, up: 2, left: 3 };
    const cellWidth = 2560 / 9;
    const cellHeight = 1440 / 4;
    const walkingFrame = Math.floor(this.elapsed * 9) % 3;
    const sourceColumn = this.player.attack > 0 ? 6 + Math.min(2, Math.floor((0.45 - this.player.attack) * 8)) : this.player.moving ? walkingFrame : 0;
    const sourceX = sourceColumn * cellWidth;
    const sourceY = directionIndex[this.player.direction] * cellHeight;

    this.ctx.save();
    this.ctx.globalAlpha = 0.26;
    this.ctx.fillStyle = "#10251b";
    this.ctx.beginPath();
    this.ctx.ellipse(this.player.x, this.player.y + 42, 42, 14, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
    if (this.player.hurt > 0) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.75;
      this.ctx.strokeStyle = "#d95c43";
      this.ctx.lineWidth = 5;
      this.ctx.beginPath();
      this.ctx.arc(this.player.x, this.player.y - 34, 46 + Math.sin(this.elapsed * 28) * 3, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }
    this.ctx.drawImage(player, sourceX, sourceY, cellWidth, cellHeight, this.player.x - 86, this.player.y - 150, 172, 218);
  }

  private drawSwordArc() {
    if (this.player.attack <= 0) return;
    const progress = 1 - this.player.attack / 0.48;
    const angles: Record<Direction, number> = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
    const angle = angles[this.player.direction];
    const start = angle - 0.95 + progress * 0.35;
    const end = angle + 0.22 + progress * 0.7;

    this.ctx.save();
    this.ctx.globalAlpha = Math.min(1, this.player.attack * 3.4);
    this.ctx.lineCap = "round";
    this.ctx.strokeStyle = "#f4d186";
    this.ctx.lineWidth = 15;
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y - 40, 96, start, end);
    this.ctx.stroke();
    this.ctx.strokeStyle = "#b13d2d";
    this.ctx.lineWidth = 6;
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y - 40, 96, start + 0.05, end - 0.04);
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawForeground() {
    const { tilemap } = this.images!;
    this.ctx.globalAlpha = 0.95;
    this.ctx.drawImage(tilemap, 600, 500, 285, 315, 1060, 1310, 136, 144);
    this.ctx.drawImage(tilemap, 600, 500, 285, 315, 1140, 1340, 120, 128);
    this.ctx.globalAlpha = 1;
  }

  private drawVignette() {
    const gradient = this.ctx.createRadialGradient(VIEW_WIDTH / 2, VIEW_HEIGHT / 2, VIEW_HEIGHT * 0.18, VIEW_WIDTH / 2, VIEW_HEIGHT / 2, VIEW_WIDTH * 0.75);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(19,32,23,0.38)");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  }
}
