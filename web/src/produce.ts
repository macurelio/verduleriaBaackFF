import lechuga from './assets/photos/lechuga.jpg'
import espinaca from './assets/photos/espinaca.jpg'
import acelga from './assets/photos/acelga.jpg'
import rucula from './assets/photos/rucula.jpg'
import papa from './assets/photos/papa.jpg'
import cebolla from './assets/photos/cebolla.jpg'
import zanahoria from './assets/photos/zanahoria.jpg'
import betarraga from './assets/photos/betarraga.jpg'
import tomate from './assets/photos/tomate.jpg'
import palta from './assets/photos/palta.jpg'
import limon from './assets/photos/limon.jpg'
import platano from './assets/photos/platano.jpg'
import cilantro from './assets/photos/cilantro.jpg'
import perejil from './assets/photos/perejil.jpg'
import frutilla from './assets/photos/frutilla.jpg'
import zapallo from './assets/photos/zapallo.jpg'

// Fotos reales fotorrealistas de verduras, frutos secos y condimentos
import ajo from './assets/photos/ajo.jpg'
import aceituna from './assets/photos/aceituna.jpg'
import albahaca from './assets/photos/albahaca.jpg'
import almendra from './assets/photos/almendra.jpg'
import arandano from './assets/photos/arandano.jpg'
import camote from './assets/photos/camote.jpg'
import pimiento from './assets/photos/pimiento.jpg'
import choclo from './assets/photos/choclo.jpg'

// Fotos reales dedicadas para categorías del mercado
import catHojasVerdes from './assets/photos/cat_hojas_verdes.jpg'
import catRaices from './assets/photos/cat_raices.jpg'
import catFrutas from './assets/photos/cat_frutas.jpg'
import catAromaticas from './assets/photos/cat_aromaticas.jpg'

// ─────────────────────────────────────────────────────────────────────────────
// Imágenes de frutas y verduras.
//  - Fuente principal: fotos reales fotorrealistas de estudio.
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
  r5: camote,
  f1: tomate,
  f2: palta,
  f3: limon,
  f4: platano,
  f5: arandano,
  a1: cilantro,
  a2: perejil,
  a3: albahaca,
  a4: ajo,
  d1: aceituna,
  d2: almendra,
  v1: pimiento,
  v2: choclo,
}

const PHOTO_BY_EMOJI: Record<string, string> = {
  '🥬': lechuga,
  '🍃': espinaca,
  '🥗': catHojasVerdes,
  '🌿': albahaca,
  '🥔': papa,
  '🧅': cebolla,
  '🥕': zanahoria,
  '🫒': aceituna,
  '🍅': tomate,
  '🥑': palta,
  '🍋': limon,
  '🍌': platano,
  '🍀': perejil,
  '🧺': catRaices,
  '🍓': frutilla,
  '🎃': zapallo,
  '🧄': ajo,
  '🥜': almendra,
  '🫐': arandano,
  '🍠': camote,
  '🫑': pimiento,
  '🌽': choclo,
  '🎁': catFrutas,
}

const CATEGORY_PHOTO: Record<string, string> = {
  'Hojas Verdes': catHojasVerdes,
  'Raíces y Tubérculos': catRaices,
  Frutas: catFrutas,
  'Hierbas y Aromáticas': catAromaticas,
  'Frutos Secos': almendra,
  Despensa: aceituna,
  Packs: catRaices,
  Promociones: catRaices,
}

const SUGGESTED_PACK_PHOTO: Record<string, string> = {
  'pack-ensalada': catHojasVerdes,
  'pack-semanal': catRaices,
  'pack-frutas': catFrutas,
  'pack-cocina': catAromaticas,
}

const NAME_KEYWORDS: [RegExp, string][] = [
  [/lechuga/i, lechuga],
  [/espinaca/i, espinaca],
  [/acelga/i, acelga],
  [/rucula|rúcula/i, rucula],
  [/camote|batata/i, camote],
  [/papa/i, papa],
  [/cebolla/i, cebolla],
  [/zanahoria/i, zanahoria],
  [/betarraga|remolacha/i, betarraga],
  [/tomate/i, tomate],
  [/palta|aguacate/i, palta],
  [/limon|limón/i, limon],
  [/platano|plátano|banana/i, platano],
  [/albahaca/i, albahaca],
  [/cilantro/i, cilantro],
  [/perejil/i, perejil],
  [/ajo/i, ajo],
  [/aceituna/i, aceituna],
  [/almendra/i, almendra],
  [/arandano|arándano|blueberry/i, arandano],
  [/pimiento|morron|morrón/i, pimiento],
  [/choclo|maiz|maíz/i, choclo],
  [/frutilla|fresa/i, frutilla],
  [/zapallo|calabaza/i, zapallo],
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
  if (item.name) {
    for (const [pattern, img] of NAME_KEYWORDS) {
      if (pattern.test(item.name)) return img
    }
  }
  if (item.emoji) return PHOTO_BY_EMOJI[item.emoji]
  return undefined
}

export function getSuggestedPackImage(id: string): string | undefined {
  return SUGGESTED_PACK_PHOTO[id]
}

export function getCategoryImage(name: string): string | undefined {
  return CATEGORY_PHOTO[name]
}