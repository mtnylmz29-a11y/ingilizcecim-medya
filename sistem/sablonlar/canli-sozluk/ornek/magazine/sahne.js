// magazine: iki ışık kutusu. Çöl ikindisi (Arap depoları, kervan) → s06'da gece limanı (Akdeniz tüccarları, İtalya)
import { kervansaray, venedikLimani } from './sablon/sahneler/ornekler.js';
export default K => [kervansaray(K), venedikLimani(K, { bas: 's06' })];
