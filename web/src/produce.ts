import lechuga from './assets/photos/lechuga.png'
import espinaca from './assets/photos/espinaca.png'
import acelga from './assets/photos/acelga.png'
import rucula from './assets/photos/rucula.png'
import papa from './assets/photos/papa.png'
import cebolla from './assets/photos/cebolla.png'
import zanahoria from './assets/photos/zanahoria.png'
import betarraga from './assets/photos/betarraga.png'
import tomate from './assets/photos/tomate.png'
import palta from './assets/photos/palta.png'
import limon from './assets/photos/limon.png'
import platano from './assets/photos/platano.png'
import cilantro from './assets/photos/cilantro.png'
import perejil from './assets/photos/perejil.png'
import ensalada from './assets/photos/ensalada.png'
import canasta from './assets/photos/canasta.png'
import frutilla from './assets/photos/frutilla.png'
import zapallo from './assets/photos/zapallo.png'

import lechugaSvg from './assets/produce/lechuga.svg'
import espinacaSvg from './assets/produce/espinaca.svg'
import acelgaSvg from './assets/produce/acelga.svg'
import ruculaSvg from './assets/produce/rucula.svg'
import papaSvg from './assets/produce/papa.svg'
import cebollaSvg from './assets/produce/cebolla.svg'
import zanahoriaSvg from './assets/produce/zanahoria.svg'
import betarragaSvg from './assets/produce/betarraga.svg'
import tomateSvg from './assets/produce/tomate.svg'
import paltaSvg from './assets/produce/palta.svg'
import limonSvg from './assets/produce/limon.svg'
import platanoSvg from './assets/produce/platano.svg'
import cilantroSvg from './assets/produce/cilantro.svg'
import perejilSvg from './assets/produce/perejil.svg'
import ensaladaSvg from './assets/produce/ensalada.svg'
import canastaSvg from './assets/produce/canasta.svg'
import frutillaSvg from './assets/produce/frutilla.svg'
import zapalloSvg from './assets/produce/zapallo.svg'

// ─────────────────────────────────────────────────────────────────────────────
// Imágenes de frutas y verduras.
//  - Fuente principal: fotos PNG fotorrealistas generadas con IA (768×768).
//  - Fallback: ilustraciones SVG ("Open Crop Icons").
//  - Fallback contextual por nombre de producto y por emoji.
// ─────────────────────────────────────────────────────────────────────────────

const PHOTO_BY_ID: Record<string, string> = {
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

const SVG_BY_ID: Record<string, string> = {
  h1: lechugaSvg,
  h2: espinacaSvg,
  h3: acelgaSvg,
  h4: ruculaSvg,
  r1: papaSvg,
  r2: cebollaSvg,
  r3: zanahoriaSvg,
  r4: betarragaSvg,
  f1: tomateSvg,
  f2: paltaSvg,
  f3: limonSvg,
  f4: platanoSvg,
  a1: cilantroSvg,
  a2: perejilSvg,
}

const PHOTO_BY_EMOJI: Record<string, string> = {
  '🥬': lechuga,
  '🍃': espinaca,
  '🥗': acelga,
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
  '🧄': cebolla,
  '🥜': papa,
  '🫐': frutilla,
  '🍠': papa,
}

const SVG_BY_EMOJI: Record<string, string> = {
  '🥬': lechugaSvg,
  '🍃': espinacaSvg,
  '🥗': acelgaSvg,
  '🌿': cilantroSvg,
  '🥔': papaSvg,
  '🧅': cebollaSvg,
  '🥕': zanahoriaSvg,
  '🫒': betarragaSvg,
  '🍅': tomateSvg,
  '🥑': paltaSvg,
  '🍋': limonSvg,
  '🍌': platanoSvg,
  '🍀': perejilSvg,
  '🧺': canastaSvg,
  '🍓': frutillaSvg,
  '🎃': zapalloSvg,
  '🧄': cebollaSvg,
  '🥜': papaSvg,
  '🫐': frutillaSvg,
  '🍠': papaSvg,
}

const CATEGORY_PHOTO: Record<string, string> = {
  'Hojas Verdes': ensalada,
  'Raíces y Tubérculos': zanahoria,
  Frutas: tomate,
  'Hierbas y Aromáticas': perejil,
}

const CATEGORY_SVG: Record<string, string> = {
  'Hojas Verdes': ensaladaSvg,
  'Raíces y Tubérculos': zanahoriaSvg,
  Frutas: tomateSvg,
  'Hierbas y Aromáticas': perejilSvg,
}

const PROMO_PHOTO: Record<string, string> = {
  'promo-1': ensalada,
  'promo-2': canasta,
  'promo-3': frutilla,
  'promo-4': zapallo,
}

const PROMO_SVG: Record<string, string> = {
  'promo-1': ensaladaSvg,
  'promo-2': canastaSvg,
  'promo-3': frutillaSvg,
  'promo-4': zapalloSvg,
}

const NAME_KEYWORDS: [RegExp, string][] = [
  [/lechuga/i, lechuga],
  [/espinaca/i, espinaca],
  [/acelga/i, acelga],
  [/rucula|rúcula/i, rucula],
  [/papa/i, papa],
  [/cebolla/i, cebolla],
  [/zanahoria/i, zanahoria],
  [/betarraga|remolacha/i, betarraga],
  [/tomate/i, tomate],
  [/palta|aguacate/i, palta],
  [/limon|limón/i, limon],
  [/platano|plátano|banana/i, platano],
  [/cilantro/i, cilantro],
  [/perejil/i, perejil],
  [/albahaca/i, cilantro],
  [/frutilla|fresa/i, frutilla],
  [/zapallo|calabaza/i, zapallo],
  [/camote/i, papa],
  [/arandano|arándano/i, frutilla],
  [/aceituna/i, betarraga],
  [/ajo/i, cebolla],
  [/almendra/i, papa],
]

export interface ProduceLike {
  id?: string
  name?: string
  emoji?: string
  image?: string
}

export function getProduceImage(item: ProduceLike | null | undefined): string | undefined {
  if (!item) return undefined
  if (item.image) return item.image
  if (item.id && PHOTO_BY_ID[item.id]) return PHOTO_BY_ID[item.id]
  if (item.id && SVG_BY_ID[item.id]) return SVG_BY_ID[item.id]
  if (item.name) {
    for (const [pattern, img] of NAME_KEYWORDS) {
      if (pattern.test(item.name)) return img
    }
  }
  if (item.emoji) return PHOTO_BY_EMOJI[item.emoji] ?? SVG_BY_EMOJI[item.emoji]
  return undefined
}

export function getPromoImage(promo: ProduceLike): string | undefined {
  if (promo.id && PROMO_PHOTO[promo.id]) return PROMO_PHOTO[promo.id]
  if (promo.id && PROMO_SVG[promo.id]) return PROMO_SVG[promo.id]
  if (promo.emoji) return PHOTO_BY_EMOJI[promo.emoji] ?? SVG_BY_EMOJI[promo.emoji]
  return undefined
}

export function getCategoryImage(name: string): string | undefined {
  return CATEGORY_PHOTO[name] ?? CATEGORY_SVG[name]
}