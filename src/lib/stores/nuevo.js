import { writable, get } from 'svelte/store';

/* ----------------------------- IDs finalistas ----------------------------- */
export const FINALISTA_A_ID = 'PDC';
export const FINALISTA_B_ID = 'LIB';

/* ------------------------------- Controles -------------------------------- */
export const destinoGlobal = writable('A'); // 'A' | 'B' | 'NULO'

/* --------------------------- Valores iniciales ---------------------------- */
/** OJO: si cambias los “valores de fábrica”, hazlo aquí */
const INITIAL = {
	habilitados: 7936515,
	emitidos: 6900418,
	blanco: { votos: 172835, pct: 2.5 },
	nulo: { votos: 1371049, baseVotos: 1371049, pct: 19.87 },
	partidos: [
		{ id: 'AP', name: 'AP', color: '#66BEE5', votos: 456002, baseVotos: 456002, pct: 8.51 },
		{ id: 'LYP', name: 'LYP ADN', color: '#444444', votos: 77576, baseVotos: 77576, pct: 1.45 },
		{
			id: 'APB',
			name: 'APB SÚMATE',
			color: '#8E66C4',
			votos: 361640,
			baseVotos: 361640,
			pct: 6.75
		},
		{ id: 'LIB', name: 'LIBRE', color: '#F06B66', votos: 1430176, baseVotos: 1430176, pct: 26.7 },
		{ id: 'FP', name: 'FP', color: '#A9E4F3', votos: 89253, baseVotos: 89253, pct: 1.67 },
		{ id: 'MAS', name: 'MAS-IPSP', color: '#3E5FA8', votos: 169887, baseVotos: 169887, pct: 3.17 },
		{ id: 'UNI', name: 'UNIDAD', color: '#F6C95C', votos: 1054568, baseVotos: 1054568, pct: 19.69 },
		{ id: 'PDC', name: 'PDC', color: '#4AA5A3', votos: 1717432, baseVotos: 1717432, pct: 32.06 }
	]
};

/* --------------------------- Datos base (writables) ----------------------- */
export const habilitados = writable(INITIAL.habilitados);
export const emitidos = writable(INITIAL.emitidos);
export const blanco = writable({ ...INITIAL.blanco });
export const nulo = writable({ ...INITIAL.nulo });
export const partidos = writable(INITIAL.partidos.map((p) => ({ ...p })));

/* ------------------------------- KPIs & UI -------------------------------- */
export const kpis = writable({
	validos: { votos: 0, pctEmit: 0 },
	emitidos: { votos: 0, pctHabilitados: 0 },
	nulos: { votos: 0, pctEmit: 0 },
	habilitados: 0
});
export const pctA_valid = writable(0);
export const pctB_valid = writable(0);

/* ------------------------------ Utilidades -------------------------------- */
function clamp(v, a, b) {
	return Math.max(a, Math.min(b, v));
}
function findIdx(arr, id) {
	return arr.findIndex((p) => p.id === id);
}

/* ----------------------------- Recompute all ------------------------------ */
export function recomputeAll() {
	const _hab = get(habilitados) || 0;
	const _emi = get(emitidos) || 0;
	const _bl = get(blanco)?.votos || 0;
	const _nu = get(nulo)?.votos || 0;
	const _part = get(partidos);

	const validTarget = Math.max(0, _emi - _bl - _nu);
	const safeValid = validTarget || 1;

	const updated = _part.map((p) => ({
		...p,
		pct: (100 * (p.votos || 0)) / safeValid
	}));
	partidos.set(updated);

	kpis.set({
		validos: { votos: validTarget, pctEmit: _emi ? (100 * validTarget) / _emi : 0 },
		emitidos: { votos: _emi, pctHabilitados: _hab ? (100 * _emi) / _hab : 0 },
		nulos: { votos: _nu, pctEmit: _emi ? (100 * _nu) / _emi : 0 },
		habilitados: _hab
	});

	const pA = updated.find((p) => p.id === FINALISTA_A_ID);
	const pB = updated.find((p) => p.id === FINALISTA_B_ID);
	const vA = pA?.votos || 0;
	const vB = pB?.votos || 0;

	pctA_valid.set((100 * vA) / safeValid);
	pctB_valid.set((100 * vB) / safeValid);
}

/* --------- Setters usados por los componentes (drag, etc.) --------------- */
export function setPartidoVotos(name, votos) {
	partidos.update((arr) => arr.map((p) => (p.name === name ? { ...p, votos } : p)));
	recomputeAll();
}

/**
 * Cuando arrastras Nulo:
 *  - Calculamos delta = nuevoNulo - viejoNulo
 *  - Si delta < 0 (baja Nulo): añadimos |delta| a destino (A / B / NULO=>mitad y mitad)
 *  - Si delta > 0 (sube Nulo): restamos delta desde destino (sin dejar negativos)
 */
export function setNuloVotos(nextVotosRaw) {
	const _emi = get(emitidos) || 0;
	const _nuObj = get(nulo);
	const _dest = get(destinoGlobal); // 'A' | 'B' | 'NULO'

	const prev = _nuObj?.votos || 0;
	const next = Math.max(0, +nextVotosRaw || 0);
	const delta = next - prev; // + sube Nulo, - baja Nulo

	// Actualiza Nulo (pct sobre emitidos)
	nulo.set({ ..._nuObj, votos: next, pct: _emi ? (100 * next) / _emi : 0 });

	// Ajuste de partidos según destino
	if (delta !== 0) {
		partidos.update((arr) => {
			const idxA = findIdx(arr, FINALISTA_A_ID);
			const idxB = findIdx(arr, FINALISTA_B_ID);
			if (idxA === -1 || idxB === -1) return arr;

			const adj = (index, d) => {
				if (index < 0 || d === 0) return;
				const p = arr[index];
				const nv = clamp((p.votos || 0) + d, 0, Number.POSITIVE_INFINITY);
				arr[index] = { ...p, votos: nv };
			};

			if (_dest === 'A') {
				adj(idxA, -delta); // si Nulo baja (delta<0), -delta es positivo => suma a A
			} else if (_dest === 'B') {
				adj(idxB, -delta);
			} else {
				// 'NULO' => reparte entre A y B
				adj(idxA, -delta / 2);
				adj(idxB, -delta / 2);
			}
			return arr;
		});
	}

	// Recalcula KPIs / termómetro con la nueva identidad
	recomputeAll();
}

/* ------------------------------- RESET SUAVE ------------------------------ */
/** Restaura TODOS los stores a sus valores de fábrica, con animaciones fluidas */
export function resetAllStores() {
	destinoGlobal.set('A');

	habilitados.set(INITIAL.habilitados);
	emitidos.set(INITIAL.emitidos);
	blanco.set({ ...INITIAL.blanco });
	nulo.set({ ...INITIAL.nulo });

	// clones para no compartir referencias
	partidos.set(INITIAL.partidos.map((p) => ({ ...p })));

	// recalcula al final para alinear KPIs/termómetro
	recomputeAll();
}

/* --------------------- Inicializa porcentajes al cargar ------------------- */
recomputeAll();
