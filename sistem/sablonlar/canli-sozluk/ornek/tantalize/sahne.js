// tantalize: tek çizgi film sahnesi. Lügat, Tantalos gibi havuzda: üzüme uzanır (s06), suya eğilir (s07), sonda yine dener (s11)
import { tantalosHavuzu } from './sablon/sahneler/ornekler.js';
export default K => [tantalosHavuzu(K, { uzan: K.at('s06'), egil: K.at('s07'), yine: K.at('s11') })];
