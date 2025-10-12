// en src/lib/stores/nuevo.js
import { derived } from 'svelte/store';
import { partidos, nulo, destinoGlobal, FINALISTA_A_ID, FINALISTA_B_ID } from './nuevo';

export const redistribucion = derived(
  [partidos, nulo, destinoGlobal],
  ([$partidos, $nulo, $destinoGlobal]) => {
    // --- incluir partidos normales ---
    let resultados = $partidos
      .filter(p => p.id !== FINALISTA_A_ID && p.id !== FINALISTA_B_ID)
      .map(p => {
        const base = p.baseVotos || 0;
        const actual = p.votos || 0;
        const delta = Math.max(0, base - actual);

        let transferidoA = 0;
        let transferidoB = 0;

        if (delta > 0) {
          if ($destinoGlobal === 'A') {
            transferidoA = delta;
          } else if ($destinoGlobal === 'B') {
            transferidoB = delta;
          } else {
            transferidoA = delta / 2;
            transferidoB = delta / 2;
          }
        }

        return {
          id: p.id,
          name: p.name,
          base,
          transferidoA,
          transferidoB,
          pctA: base ? (100 * transferidoA) / base : 0,
          pctB: base ? (100 * transferidoB) / base : 0
        };
      });

    // --- incluir Nulo ---
    if ($nulo) {
      const base = $nulo.baseVotos || 0;
      const actual = $nulo.votos || 0;
      const delta = Math.max(0, base - actual);

      let transferidoA = 0;
      let transferidoB = 0;

      if (delta > 0) {
        if ($destinoGlobal === 'A') {
          transferidoA = delta;
        } else if ($destinoGlobal === 'B') {
          transferidoB = delta;
        } else {
          transferidoA = delta / 2;
          transferidoB = delta / 2;
        }
      }

      resultados.push({
        id: 'NULO',
        name: 'Nulo',
        base,
        transferidoA,
        transferidoB,
        pctA: base ? (100 * transferidoA) / base : 0,
        pctB: base ? (100 * transferidoB) / base : 0
      });
    }

    return resultados;
  }
);