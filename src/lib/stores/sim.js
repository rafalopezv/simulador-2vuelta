import { writable, get } from 'svelte/store';

// FINALISTAS (ids en tu dataset)
export const FINALISTA_A_ID = 'PDC';
export const FINALISTA_B_ID = 'LIB';

// Controles globales
export const destinoGlobal = writable('A'); // 'A' | 'B' | 'NULO'

// Fijos base
export const ambito = writable('MUNDIAL');
export const nodoSeleccionado = writable('Total');
export const habilitados = writable(7936515);
export const emitidos = writable(6900418);
export const blanco = writable({ votos: 172835, pct: 2.5 });
export const nulo = writable({ votos: 1364684, baseVotos: 1364684, pct: 19.78 });

// Partidos (mock)
export const partidos = writable([
	{ id: 'AP', name: 'AP', color: '#66BEE5', votos: 456002, pct: 8.51, baseVotos: 456002 },
	{ id: 'LYP', name: 'LYP ADN', color: '#444444', votos: 77576, baseVotos: 77576, pct: 1.45 },
	{ id: 'APB', name: 'APB SÚMATE', color: '#8E66C4', votos: 361640, baseVotos: 361640, pct: 6.75 },
	{ id: 'LIB', name: 'LIBRE', color: '#F06B66', votos: 1430176, baseVotos: 1430176, pct: 26.7 },
	{ id: 'FP', name: 'FP', color: '#A9E4F3', votos: 89253, baseVotos: 89253, pct: 1.67 },
	{ id: 'MAS', name: 'MAS-IPSP', color: '#3E5FA8', votos: 169887, baseVotos: 169887, pct: 3.17 },
	{ id: 'UNI', name: 'UNIDAD', color: '#F6C95C', votos: 1054568, baseVotos: 1054568, pct: 19.69 },
	{ id: 'PDC', name: 'PDC', color: '#4AA5A3', votos: 1717432, baseVotos: 1717432, pct: 32.06 }
]);

// KPIs (mock)
export const kpis = writable({
	validos: { votos: 0, pctEmit: 0 },
	emitidos: { votos: 0, pctHabilitados: 0 },
	nulos: { votos: 0, pctEmit: 0 },
	habilitados: 0
});

export const pctA_valid = writable(0);
export const pctB_valid = writable(0);

/** Recalcula KPIs y pcts de termómetro a partir de stores actuales */
export function recomputeAll() {
	const _hab = get(habilitados) || 0;
	const _emi = get(emitidos) || 0;
	const _bl = get(blanco)?.votos || 0;
	const _nu = get(nulo)?.votos || 0;
	const _part = get(partidos) || [];

	const validTarget = Math.max(0, _emi - _bl - _nu);
	const safeValid = validTarget || 1;
	const partUpd = _part.map((p) => ({ ...p, pct: (100 * (p.votos || 0)) / safeValid }));

	partidos.set(partUpd);
	kpis.set({
		validos: { votos: validTarget, pctEmit: _emi ? (100 * validTarget) / _emi : 0 },
		emitidos: { votos: _emi, pctHabilitados: _hab ? (100 * _emi) / _hab : 0 },
		nulos: { votos: _nu, pctEmit: _emi ? (100 * _nu) / _emi : 0 },
		habilitados: _hab
	});

	const pA = partUpd.find((p) => p.id === FINALISTA_A_ID);
	const pB = partUpd.find((p) => p.id === FINALISTA_B_ID);
	const vA = pA?.votos || 0;
	const vB = pB?.votos || 0;

	pctA_valid.set((100 * vA) / safeValid);
	pctB_valid.set((100 * vB) / safeValid);
}

/** Aplica “masa” faltante/sobrante a finalistas según selector */
export function rebalanceToDestino(shortage) {
	if (!shortage) return;
	const dest = get(destinoGlobal); // 'A' | 'B' | 'NULO'
	partidos.update((arr) => {
		const idxA = arr.findIndex((p) => p.id === FINALISTA_A_ID);
		const idxB = arr.findIndex((p) => p.id === FINALISTA_B_ID);
		if (idxA === -1 || idxB === -1) return arr;

		const addTo = (index, delta) => {
			if (index < 0 || delta === 0) return;
			const p = arr[index];
			const max = Number.POSITIVE_INFINITY; // Finalistas pueden pasar baseline
			const min = 0;
			const nv = Math.max(min, Math.min((p.votos || 0) + delta, max));
			arr[index] = { ...p, votos: nv };
		};

		if (dest === 'A') {
			addTo(idxA, shortage);
		} else if (dest === 'B') {
			addTo(idxB, shortage);
		} else {
			// 'NULO' → reparte parejo entre finalistas
			addTo(idxA, shortage / 2);
			addTo(idxB, shortage / 2);
		}
		return arr;
	});
	// Recalculate after updating partidos
	recomputeAll();
}

// Catálogos (unchanged)
export const nodosNacional = [
	'La Paz',
	'Cochabamba',
	'Santa Cruz',
	'Oruro',
	'Potosí',
	'Tarija',
	'Chuquisaca',
	'Beni',
	'Pando'
];
export const nodosExterior = [
	'Argentina',
	'Brasil',
	'España',
	'Estados Unidos',
	'Chile',
	'Perú',
	'Italia',
	'Francia',
	'Alemania',
	'Reino Unido',
	'Japón',
	'China',
	'Rusia',
	'México',
	'Colombia',
	'Ecuador',
	'Uruguay',
	'Paraguay',
	'Canadá',
	'Bélgica',
	'Suecia',
	'Noruega'
];
export const capitales = [
	{ ciudad: 'Sucre', dpto: 'Chuquisaca' },
	{ ciudad: 'La Paz', dpto: 'La Paz' },
	{ ciudad: 'Cochabamba', dpto: 'Cochabamba' },
	{ ciudad: 'Santa Cruz', dpto: 'Santa Cruz' },
	{ ciudad: 'Oruro', dpto: 'Oruro' },
	{ ciudad: 'Potosí', dpto: 'Potosí' },
	{ ciudad: 'Tarija', dpto: 'Tarija' },
	{ ciudad: 'Trinidad', dpto: 'Beni' },
	{ ciudad: 'Cobija', dpto: 'Pando' },
	{ ciudad: 'El Alto', dpto: 'La Paz' }
];
