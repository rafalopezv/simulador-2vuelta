// src/lib/stores/nuevo.js
import { writable, get } from 'svelte/store';

/* ----------------------------- IDs finalistas ----------------------------- */
export const FINALISTA_A_ID = 'PDC';
export const FINALISTA_B_ID = 'LIB';

/* ------------------------------- Controles -------------------------------- */
export const destinoGlobal = writable('B'); // 'A' | 'B' | 'NULO'

/* ------------------------------ Colores party ----------------------------- */
const COLOR_MAP = {
	AP: '#66BEE5',
	LYP: '#444444',
	APB: '#8E66C4',
	LIB: '#F06B66',
	FP: '#A9E4F3',
	MAS: '#3E5FA8',
	UNI: '#F6C95C',
	PDC: '#4AA5A3'
};
const PARTY_NAME = {
	AP: 'AP',
	LYP: 'LYP ADN',
	APB: 'APB SÚMATE',
	LIB: 'LIBRE',
	FP: 'FP',
	MAS: 'MAS-IPSP',
	UNI: 'UNIDAD',
	PDC: 'PDC'
};

/* --------------------------- Valores “de fábrica” ------------------------- */
/** OJO: si cambias los “valores de fábrica”, hazlo aquí */
const FACTORY = {
	habilitados: 7936515,
	emitidos: 6900418,
	blanco: { votos: 172835, pct: 2.5 },
	nulo: { votos: 1371049, baseVotos: 1371049, pct: 19.87 },
	partidos: [
		{ id: 'AP', name: 'AP', color: COLOR_MAP.AP, votos: 456002, baseVotos: 456002, pct: 8.51 },
		{ id: 'LYP', name: 'LYP ADN', color: COLOR_MAP.LYP, votos: 77576, baseVotos: 77576, pct: 1.45 },
		{
			id: 'APB',
			name: 'APB SÚMATE',
			color: COLOR_MAP.APB,
			votos: 361640,
			baseVotos: 361640,
			pct: 6.75
		},
		{
			id: 'LIB',
			name: 'LIBRE',
			color: COLOR_MAP.LIB,
			votos: 1430176,
			baseVotos: 1430176,
			pct: 26.7
		},
		{ id: 'FP', name: 'FP', color: COLOR_MAP.FP, votos: 89253, baseVotos: 89253, pct: 1.67 },
		{
			id: 'MAS',
			name: 'MAS-IPSP',
			color: COLOR_MAP.MAS,
			votos: 169887,
			baseVotos: 169887,
			pct: 3.17
		},
		{
			id: 'UNI',
			name: 'UNIDAD',
			color: COLOR_MAP.UNI,
			votos: 1054568,
			baseVotos: 1054568,
			pct: 19.69
		},
		{ id: 'PDC', name: 'PDC', color: COLOR_MAP.PDC, votos: 1717432, baseVotos: 1717432, pct: 32.06 }
	]
};

/* --------------------------- Datos base (writables) ----------------------- */
// Estado visible (mutable)
export const habilitados = writable(FACTORY.habilitados);
export const emitidos = writable(FACTORY.emitidos);
export const blanco = writable({ ...FACTORY.blanco });
export const nulo = writable({ ...FACTORY.nulo });
export const partidos = writable(FACTORY.partidos.map((p) => ({ ...p })));

// KPIs / termómetro
export const kpis = writable({
	validos: { votos: 0, pctEmit: 0 },
	emitidos: { votos: 0, pctHabilitados: 0 },
	nulos: { votos: 0, pctEmit: 0 },
	habilitados: 0
});
export const pctA_valid = writable(0);
export const pctB_valid = writable(0);

// Scope actual + cache DB + baseline por scope para reset
export const currentScopeId = writable('BOL'); // por defecto Bolivia (ajústalo si tu JSON usa otro id)
let DB = null; // cache del JSON (array)
let SCOPE_BASELINE = null; // snapshot del baseline del último loadScope

/* ------------------------------ Utilidades -------------------------------- */
function clamp(v, a, b) {
	return Math.max(a, Math.min(b, v));
}
function findIdx(arr, id) {
	return arr.findIndex((p) => p.id === id);
}
function safePct(part, total) {
	return total ? (100 * part) / total : 0;
}

/* ----------------------------- Recompute all ------------------------------ */
export function recomputeAll() {
	const _hab = get(habilitados) || 0;
	const _emi = get(emitidos) || 0;
	const _bl = get(blanco)?.votos || 0;
	const _nu = get(nulo)?.votos || 0;
	const _part = get(partidos);

	// válidos = emitidos - blanco - nulo
	const validTarget = Math.max(0, _emi - _bl - _nu);
	const safeValid = validTarget || 1;

	const updated = _part.map((p) => ({
		...p,
		pct: (100 * (p.votos || 0)) / safeValid
	}));
	partidos.set(updated);

	kpis.set({
		validos: { votos: validTarget, pctEmit: safePct(validTarget, _emi) },
		emitidos: { votos: _emi, pctHabilitados: safePct(_emi, _hab) },
		nulos: { votos: _nu, pctEmit: safePct(_nu, _emi) },
		habilitados: _hab
	});

	const pA = updated.find((p) => p.id === FINALISTA_A_ID);
	const pB = updated.find((p) => p.id === FINALISTA_B_ID);
	const vA = pA?.votos || 0;
	const vB = pB?.votos || 0;

	pctA_valid.set((100 * vA) / safeValid);
	pctB_valid.set((100 * vB) / safeValid);
}

/* ----------------------- Setters usados por la UI ------------------------- */
export function setPartidoVotos(name, votos) {
	partidos.update((arr) => arr.map((p) => (p.name === name ? { ...p, votos } : p)));
	recomputeAll();
}

/**
 * Cuando arrastras Nulo:
 *  - delta = nuevoNulo - viejoNulo
 *  - delta < 0 (baja nulo): añadimos |delta| a destino (A / B / NULO => mitad/mitad)
 *  - delta > 0 (sube nulo): restamos delta desde destino (sin dejar negativos)
 */
export function setNuloVotos(nextVotosRaw) {
	const _emi = get(emitidos) || 0;
	const _nuObj = get(nulo);
	const _dest = get(destinoGlobal); // 'A' | 'B' | 'NULO'

	const prev = _nuObj?.votos || 0;
	const next = Math.max(0, +nextVotosRaw || 0);
	const delta = next - prev; // + sube Nulo, - baja Nulo

	// Actualiza Nulo (pct sobre emitidos)
	nulo.set({ ..._nuObj, votos: next, pct: safePct(next, _emi) });

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

	recomputeAll();
}

/* --------------------------------- RESET ---------------------------------- */
/** Reset a valores “de fábrica” (los del archivo FACTORY, no del scope cargado) */
export function resetAllStores() {
	destinoGlobal.set('A');

	habilitados.set(FACTORY.habilitados);
	emitidos.set(FACTORY.emitidos);
	blanco.set({ ...FACTORY.blanco });
	nulo.set({ ...FACTORY.nulo });

	partidos.set(FACTORY.partidos.map((p) => ({ ...p })));
	recomputeAll();
}

/** Reset al baseline del *scope* actualmente cargado (si existe snapshot) */
export function resetToScopeBaseline() {
	if (!SCOPE_BASELINE) return;
	const b = SCOPE_BASELINE;

	destinoGlobal.set('A');
	habilitados.set(b.habilitados);
	emitidos.set(b.emitidos);
	blanco.set({ ...b.blanco });
	nulo.set({ ...b.nulo });
	partidos.set(b.partidos.map((p) => ({ ...p })));
	recomputeAll();
}

/* --------------------------- Carga desde el JSON -------------------------- */
async function loadDB() {
	if (DB) return DB;
	const res = await fetch('/base_hojas.json');
	if (!res.ok) throw new Error('No se pudo cargar /base_hojas.json');
	DB = await res.json(); // se espera un array de filas (vertical)
	return DB;
}

/** Convierte filas (mismo nodo_id) a estado de stores */
function buildFromRows(rows) {
	if (!rows || rows.length === 0) return null;

	const base = rows[0]; // habilitados / emitidos / blanco / nulo / validos iguales en todas las filas del nodo
	const emi = +base.emitidos || 0;
	const val = +base.validos || Math.max(0, emi - (+base.blanco || 0) - (+base.nulo || 0)) || 1;

	const partidosArr = rows.map((r) => {
		const id = r.party_id;
		return {
			id,
			name: PARTY_NAME[id] || id,
			color: COLOR_MAP[id] || '#999999',
			votos: +r.votos || 0,
			baseVotos: +r.votos || 0,
			pct: safePct(+r.votos || 0, val)
		};
	});

	return {
		habilitados: +base.habilitados || 0,
		emitidos: +base.emitidos || 0,
		blanco: { votos: +base.blanco || 0, pct: safePct(+base.blanco || 0, emi) },
		nulo: {
			votos: +base.nulo || 0,
			baseVotos: +base.nulo || 0,
			pct: safePct(+base.nulo || 0, emi)
		},
		partidos: partidosArr
	};
}

/**
 * Carga un scope por nodo_id: ej. "BOL", "DEP-LP", "CAP-LP-LPZ", "NO-CAP-SC-SCZ", "EXT-ARG", etc.
 * Deja un snapshot (SCOPE_BASELINE) para poder hacer reset al baseline de ese scope.
 */
export async function loadScope(nodo_id = 'BOL') {
	const db = await loadDB();

	const rows = db.filter((d) => d.nodo_id === nodo_id);
	if (rows.length === 0) {
		console.warn('[loadScope] No hay datos para nodo_id:', nodo_id);
		return;
	}

	const state = buildFromRows(rows);
	if (!state) return;

	// set snapshot baseline del scope
	SCOPE_BASELINE = JSON.parse(JSON.stringify(state));

	// aplicar a stores
	currentScopeId.set(nodo_id);
	destinoGlobal.set('A');

	habilitados.set(state.habilitados);
	emitidos.set(state.emitidos);
	blanco.set({ ...state.blanco });
	nulo.set({ ...state.nulo });
	partidos.set(state.partidos.map((p) => ({ ...p })));

	recomputeAll();
}

/* --------------------- Inicializa porcentajes al cargar ------------------- */
recomputeAll();
