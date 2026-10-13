const photos = {
  h1: require('../assets/photos/lechuga.jpg'),
  h2: require('../assets/photos/espinaca.jpg'),
  h3: require('../assets/photos/acelga.jpg'),
  h4: require('../assets/photos/rucula.jpg'),
  r1: require('../assets/photos/papa.jpg'),
  r2: require('../assets/photos/cebolla.jpg'),
  r3: require('../assets/photos/zanahoria.jpg'),
  r4: require('../assets/photos/betarraga.jpg'),
  r5: require('../assets/photos/camote.jpg'),
  f1: require('../assets/photos/tomate.jpg'),
  f2: require('../assets/photos/palta.jpg'),
  f3: require('../assets/photos/limon.jpg'),
  f4: require('../assets/photos/platano.jpg'),
  f5: require('../assets/photos/arandano.jpg'),
  a1: require('../assets/photos/cilantro.jpg'),
  a2: require('../assets/photos/perejil.jpg'),
  a3: require('../assets/photos/albahaca.jpg'),
  a4: require('../assets/photos/ajo.jpg'),
  d1: require('../assets/photos/aceituna.jpg'),
  d2: require('../assets/photos/almendra.jpg'),
};

export const getProduceImage = product => product.image ? { uri: product.image } : photos[product.id];
