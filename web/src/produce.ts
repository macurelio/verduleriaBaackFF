import lechuga from './assets/produce/lechuga.svg'
import espinaca from './assets/produce/espinaca.svg'
import acelga from './assets/produce/acelga.svg'
import rucula from './assets/produce/rucula.svg'
import papa from './assets/produce/papa.svg'
import cebolla from './assets/produce/cebolla.svg'
import zanahoria from './assets/produce/zanahoria.svg'
import betarraga from './assets/produce/betarraga.svg'
import tomate from './assets/produce/tomate.svg'
import palta from './assets/produce/palta.svg'
import limon from './assets/produce/limon.svg'
import platano from './assets/produce/platano.svg'
import cilantro from './assets/produce/cilantro.svg'
import perejil from './assets/produce/perejil.svg'
import ensalada from './assets/produce/ensalada.svg'
import canasta from './assets/produce/canasta.svg'
import frutilla from './assets/produce/frutilla.svg'
import zapallo from './assets/produce/zapallo.svg'

// ─────────────────────────────────────────────────────────────────────────────
// Imágenes SVG de frutas y verduras (estilo ilustración plana).
// Fuente principal: "Open Crop Icons" (openfarmcc) — CC0 / dominio público.
//   https://github.com/openfarmcc/open-crop-icons
// Palta y limón son ilustraciones propias en el mismo estilo.
// El mapeo prioriza el id del producto (catálogo fijo) y cae al emoji como
// fallback para productos nuevos creados en el admin.
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCE_BY_ID: Record<string, string> = {
  h1: lechuga,
  h2: espinaca,
  h3: acelga,
  h4: rucula,
  r1: papa,
  r2: cebolla,
  r3: zanahoria,
  r4: betarraga,
  f1: tomate,
  f2: palta,
  f3: limon,
  f4: platano,
  a1: cilantro,
  a2: perejil,
}

const PRODUCE_BY_EMOJI: Record<string, string> = {
  '🥬': lechuga,
  '🍃': espinaca,
  '🥗': ensalada,
  '🌿': cilantro,
  '🥔': papa,
  '🧅': cebolla,
  '🥕': zanahoria,
  '🫒': betarraga,
  '🍅': tomate,
  '🥑': palta,
  '🍋': limon,
  '🍌': platano,
  '🍀': perejil,
  '🧺': canasta,
  '🍓': frutilla,
  '🎃': zapallo,
}

export const CATEGORY_IMAGE: Record<string, string> = {
  'Hojas Verdes': ensalada,
  'Raíces y Tubérculos': zanahoria,
  Frutas: tomate,
  'Hierbas y Aromáticas': perejil,
}

const PROMO_IMAGE: Record<string, string> = {
  'promo-1': ensalada,
  'promo-2': canasta,
  'promo-3': frutilla,
  'promo-4': zapallo,
}

export interface ProduceLike {
  id?: string
  emoji?: string
}

export function getProduceImage(item: ProduceLike | null | undefined): string | undefined {
  if (!item) return undefined
  if (item.id && PRODUCE_BY_ID[item.id]) return PRODUCE_BY_ID[item.id]
  if (item.emoji && PRODUCE_BY_EMOJI[item.emoji]) return PRODUCE_BY_EMOJI[item.emoji]
  return undefined
}

export function getPromoImage(promo: ProduceLike): string | undefined {
  if (promo.id && PROMO_IMAGE[promo.id]) return PROMO_IMAGE[promo.id]
  if (promo.emoji && PRODUCE_BY_EMOJI[promo.emoji]) return PRODUCE_BY_EMOJI[promo.emoji]
  return undefined
}

export function getCategoryImage(name: string): string | undefined {
  return CATEGORY_IMAGE[name]
}