import vertSrc from './foilsmith.vert.glsl?raw'
import fragSrc from './foilsmith.frag.glsl?raw'
import type { CardTextures, DrawParams, TexSource } from './types'

export const FINISH_HOLO = 0
export const FINISH_STANDARD = 5

function link(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`shader: ${gl.getShaderInfoLog(s)}`)
    return s
  }
  const p = gl.createProgram()!
  gl.attachShader(p, compile(gl.VERTEX_SHADER, vs))
  gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`link: ${gl.getProgramInfoLog(p)}`)
  return p
}

interface Uploaded {
  units: WebGLTexture[]
}

/** Cards whose textures stay on the GPU; the least recently drawn is evicted past this. */
const MAX_CACHED_CARDS = 6
/** The shared context is released this long after the last card goes away. */
const IDLE_DISPOSE_MS = 10_000

/**
 * One offscreen WebGL2 context shared by every card. Shaders are compiled once and each card's
 * textures are uploaded once (keyed by card id); a card draws into the shared canvas and copies the
 * frame onto its own 2D canvas.
 */
export class FoilRenderer {
  private gl: WebGL2RenderingContext
  private prog: WebGLProgram
  private loc = new Map<string, WebGLUniformLocation | null>()
  private cache = new Map<string, Uploaded>() // insertion order = LRU order
  private disposed = false
  lost = false
  private reserved = false

  private canvas: HTMLCanvasElement

  constructor() {
    const canvas = document.createElement('canvas')
    this.canvas = canvas
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true })
    if (!gl) throw new Error('WebGL2 is not available')
    this.gl = gl
    this.prog = link(gl, vertSrc, fragSrc)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const a = gl.getAttribLocation(this.prog, 'a_pos')
    gl.enableVertexAttribArray(a)
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0)
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      this.lost = true
    })
  }

  /** Art, frame and back art are uploaded premultiplied; fx, normal and foil maps are left untouched. */
  private upload(t: CardTextures): Uploaded {
    const up = (src: TexSource, premultiply: boolean) => {
      const gl = this.gl
      const tx = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, tx)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiply)
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
      if ('data' in src) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, src.width, src.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, src.data)
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
      return tx
    }
    const { front, back, frame } = t
    const units = [
      up(front.art, true),
      up(front.fx, false),
      up(front.normal, false),
      up(back.art, true),
      up(back.fx, false),
      up(back.normal, false),
      up(frame.image, true),
      up(frame.foil, false),
    ]
    return { units }
  }

  has(id: string) {
    return this.cache.has(id) && !this.lost && !this.disposed
  }

  private texturesFor(id: string, t: CardTextures): Uploaded {
    let u = this.cache.get(id)
    if (u) {
      this.cache.delete(id)
    } else {
      u = this.upload(t)
      while (this.cache.size >= MAX_CACHED_CARDS) {
        const oldest = this.cache.keys().next().value!
        for (const tx of this.cache.get(oldest)!.units) this.gl.deleteTexture(tx)
        this.cache.delete(oldest)
      }
    }
    this.cache.set(id, u)
    return u
  }

  /** Draw one card into the shared canvas, then copy the frame onto `target` (a 2D-capable canvas). */
  draw(target: HTMLCanvasElement, id: string, textures: CardTextures, p: DrawParams) {
    const { gl } = this
    if (this.disposed || this.lost) return
    // match the buffers to the target's CSS size, at min(devicePixelRatio, 2)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(target.clientWidth * dpr))
    const h = Math.max(1, Math.round(target.clientHeight * dpr))
    if (target.width !== w || target.height !== h) {
      target.width = w
      target.height = h
    }
    // grow-only: cards of different sizes draw into a corner of one buffer, so it is never reallocated back and forth.
    // The first allocation already covers the inspector's card: growing later stalls the main thread on a GPU round trip.
    if (!this.reserved) {
      this.reserved = true
      const cw = Math.min(innerWidth * 0.88, 420, (innerHeight - 150) * textures.aspect)
      this.canvas.width = Math.max(w, Math.round(cw * 1.25 * dpr))
      this.canvas.height = Math.max(h, Math.round((cw / textures.aspect) * 1.25 * dpr))
    }
    if (this.canvas.width < w || this.canvas.height < h) {
      this.canvas.width = Math.max(this.canvas.width, w)
      this.canvas.height = Math.max(this.canvas.height, h)
    }
    const bufH = this.canvas.height
    const { units } = this.texturesFor(id, textures)
    gl.viewport(0, 0, w, h)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(this.prog)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    const names = ['u_art', 'u_fx', 'u_normal', 'u_back', 'u_back_fx', 'u_back_normal', 'u_frame', 'u_frame_foil']
    names.forEach((n, i) => {
      gl.activeTexture(gl.TEXTURE0 + i)
      gl.bindTexture(gl.TEXTURE_2D, units[i])
      gl.uniform1i(this.u(n), i)
    })
    this.i('u_has_frame', 1)
    gl.uniform2f(this.u('u_tilt'), p.yaw, p.pitch)
    this.f('u_card_scale', p.cardScale)
    this.f('u_aspect', textures.aspect)
    this.f('u_loop_period', 0)
    this.f('u_seed', p.seed)
    this.f('u_time', p.time)
    this.i('u_finish', p.finish)
    this.i('u_back_finish', 0)
    this.i('u_debug_view', 0)
    this.f('u_foil', 1)
    this.f('u_depth_scale', 0.02)
    this.f('u_glint', 1)
    this.f('u_sparkle', 0.9)
    this.f('u_glare', 0.2)
    this.f('u_relief', 0.9)
    this.f('u_shadow', 0.45)
    this.f('u_hue_cycles', 1)
    this.i('u_supersample', p.supersample ? 1 : 0)
    this.i('u_pixel_art', 0)
    gl.uniform2f(this.u('u_native_size'), 0, 0)
    this.i('u_hue_steps', 0)
    this.i('u_back_pixel_art', 0)
    gl.uniform2f(this.u('u_back_native_size'), 0, 0)
    this.i('u_back_hue_steps', 0)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    // the buffer is preserved (see the context options) and flushed, so no browser can hand this card the previous card's frame
    gl.flush()
    const ctx = target.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(this.canvas, 0, bufH - h, w, h, 0, 0, w, h) // GL's origin is bottom-left
    }
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    const gl = this.gl
    for (const u of this.cache.values()) for (const t of u.units) gl.deleteTexture(t)
    this.cache.clear()
    gl.deleteProgram(this.prog)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }

  private u(name: string) {
    if (!this.loc.has(name)) this.loc.set(name, this.gl.getUniformLocation(this.prog, name))
    return this.loc.get(name)!
  }
  private f(n: string, v: number) {
    this.gl.uniform1f(this.u(n), v)
  }
  private i(n: string, v: number) {
    this.gl.uniform1i(this.u(n), v)
  }
}

let shared: FoilRenderer | null = null
let users = 0
let idleTimer = 0

/** Take a hold on the shared renderer (creating it if needed). Throws if WebGL2 is unavailable. */
export function retainRenderer(): FoilRenderer {
  window.clearTimeout(idleTimer)
  users++
  return sharedRenderer()
}

/** The live shared renderer, replacing it if its context was lost. Throws if WebGL2 is unavailable. */
export function sharedRenderer(): FoilRenderer {
  if (shared?.lost) {
    shared.dispose()
    shared = null
  }
  return (shared ??= new FoilRenderer())
}

export function releaseRenderer() {
  users = Math.max(0, users - 1)
  if (users > 0) return
  window.clearTimeout(idleTimer)
  idleTimer = window.setTimeout(() => {
    if (users === 0) {
      shared?.dispose()
      shared = null
    }
  }, IDLE_DISPOSE_MS)
}

/** True when the shared context already holds this card's textures, so a new view can draw at once. */
export function isWarm(id: string) {
  return shared?.has(id) ?? false
}

let overlays = 0
/** An overlay (the inspector) is open: cards outside it stop drawing until it closes. Returns the release. */
export function holdOverlay() {
  overlays++
  return () => { overlays = Math.max(0, overlays - 1) }
}
export const overlayOpen = () => overlays > 0
