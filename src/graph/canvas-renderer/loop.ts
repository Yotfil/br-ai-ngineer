/**
 * Bucle de dibujo. Con animaciones activas es continuo; con animaciones detenidas pasa a bajo demanda:
 * solo dibuja tras `invalidate()` y mientras haya transiciones sin asentar. Se pausa con la pestaña oculta.
 */
export interface FrameScheduler {
  request: (cb: (t: number) => void) => number
  cancel: (id: number) => void
}

export class FrameLoop {
  private handle: number | null = null
  private dirty = true
  continuous = true
  hidden = false

  private readonly draw: (t: number) => boolean
  private readonly scheduler: FrameScheduler

  /** `draw` devuelve `true` si sigue habiendo transiciones en curso. */
  constructor(draw: (t: number) => boolean, scheduler: FrameScheduler) {
    this.draw = draw
    this.scheduler = scheduler
  }

  /** Pide un redibujo (interacción, cambio de foco o de tamaño). */
  invalidate(): void {
    this.dirty = true
    this.ensure()
  }

  setContinuous(on: boolean): void {
    this.continuous = on
    this.invalidate()
  }

  setHidden(hidden: boolean): void {
    this.hidden = hidden
    if (hidden) this.stop()
    else this.invalidate()
  }

  get scheduled(): boolean {
    return this.handle !== null
  }

  stop(): void {
    if (this.handle !== null) this.scheduler.cancel(this.handle)
    this.handle = null
  }

  private ensure(): void {
    if (this.hidden || this.handle !== null) return
    if (!this.continuous && !this.dirty) return
    this.handle = this.scheduler.request((t) => this.frame(t))
  }

  private frame(t: number): void {
    this.handle = null
    this.dirty = false
    const settling = this.draw(t)
    if (settling) this.dirty = true
    this.ensure()
  }
}
