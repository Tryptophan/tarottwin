export interface FoilManifestCard {
  art: string
  foil: string
}

export interface FoilManifest {
  aspect: number
  artAspect: number
  back: { art: string; fx: string; normal: string }
  cards: Record<string, FoilManifestCard>
}

/** Raw RGBA bytes, uploaded as-is (never premultiplied). */
export interface RawPixels {
  data: Uint8Array
  width: number
  height: number
}

export type TexSource = ImageBitmap | HTMLCanvasElement | RawPixels

export interface CardTextures {
  aspect: number
  front: { art: TexSource; fx: TexSource; normal: TexSource }
  frame: { image: TexSource; foil: TexSource }
  back: { art: TexSource; fx: TexSource; normal: TexSource }
}

export interface DrawParams {
  yaw: number
  pitch: number
  time: number
  cardScale: number
  finish: number
  supersample: boolean
  seed: number
}
