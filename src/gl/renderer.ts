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

export class FoilRenderer {
  private gl: WebGL2RenderingContext
  private prog: WebGLProgram
  private loc = new Map<string, WebGLUniformLocation | null>()
  private tex: WebGLTexture[] = []
  private units: WebGLTexture[] = []
  private textures: CardTextures | null = null
  private disposed = false

  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false })
    if (!gl) throw new Error('WebGL2 is not available')
    this.gl = gl
    this.prog = link(gl, vertSrc, fragSrc)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const a = gl.getAttribLocation(this.prog, 'a_pos')
    gl.enableVertexAttribArray(a)
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0)
  }

  /** Art, frame and back art are uploaded premultiplied; fx, normal and foil maps are left untouched. */
  setTextures(t: CardTextures) {
    this.textures = t
    const up = (src: TexSource, premultiply: boolean) => {
      const gl = this.gl
      const tx = gl.createTexture()!
      this.tex.push(tx)
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
    this.units = [
      up(front.art, true),
      up(front.fx, false),
      up(front.normal, false),
      up(back.art, true),
      up(back.fx, false),
      up(back.normal, false),
      up(frame.image, true),
      up(frame.foil, false),
    ]
  }

  /** Match the drawing buffer to the CSS size, at min(devicePixelRatio, 2). */
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(this.canvas.clientWidth * dpr))
    const h = Math.max(1, Math.round(this.canvas.clientHeight * dpr))
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    }
  }

  draw(p: DrawParams) {
    const { gl, textures } = this
    if (this.disposed || !textures) return
    this.resize()
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(this.prog)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    const names = ['u_art', 'u_fx', 'u_normal', 'u_back', 'u_back_fx', 'u_back_normal', 'u_frame', 'u_frame_foil']
    names.forEach((n, i) => {
      gl.activeTexture(gl.TEXTURE0 + i)
      gl.bindTexture(gl.TEXTURE_2D, this.units[i])
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
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    const gl = this.gl
    for (const t of this.tex) gl.deleteTexture(t)
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
