declare module 'd3-force-3d' {
  export interface SimNode {
    index?: number
    x?: number
    y?: number
    z?: number
    vx?: number
    vy?: number
    vz?: number
    fx?: number | null
    fy?: number | null
    fz?: number | null
  }
  export interface SimLink<N> {
    source: string | N
    target: string | N
  }
  type Acc<N, R> = number | ((d: N, i: number) => R)
  export interface Force<N> {
    (alpha: number): void
  }
  export interface Simulation<N extends SimNode> {
    tick(iterations?: number): this
    stop(): this
    force(name: string, force: Force<N> | null): this
    alpha(a: number): this
    alphaDecay(a: number): this
    velocityDecay(a: number): this
    randomSource(fn: () => number): this
    nodes(): N[]
  }
  export function forceSimulation<N extends SimNode>(nodes: N[], numDimensions?: number): Simulation<N>
  export interface ManyBody<N> extends Force<N> {
    strength(s: Acc<N, number>): this
    distanceMax(d: number): this
  }
  export function forceManyBody<N>(): ManyBody<N>
  export interface LinkForce<N, L> extends Force<N> {
    id(fn: (d: N) => string): this
    distance(d: number | ((l: L) => number)): this
    strength(s: number | ((l: L) => number)): this
  }
  export function forceLink<N, L extends SimLink<N>>(links: L[]): LinkForce<N, L>
  export interface AxisForce<N> extends Force<N> {
    strength(s: Acc<N, number>): this
  }
  export function forceX<N>(x?: number): AxisForce<N>
  export function forceY<N>(y?: number): AxisForce<N>
  export function forceZ<N>(z?: number): AxisForce<N>
}
