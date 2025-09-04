<script>
	// === STORES existentes ===
	import {
		partidos,
		nulo,
		emitidos,
		blanco,
		FINALISTA_A_ID,
		FINALISTA_B_ID,
		recomputeAll
	} from '$lib/stores/nuevo';

	// ======== CONTROLES ========
	const AXIS_MAX = 3_500_000; // para el ancho relativo de barras
	const STEP = 10_000; // <<— tamaño del paso por “tick”
	const MIN_INTERVAL = 45; // <<— mínimo intervalo (ms) al acelerar
	const START_INTERVAL = 300; // <<— intervalo inicial (ms)
	const ACCEL_EVERY = 4; // <<— cada cuántos ticks acelera
	const ACCEL_FACTOR = 0.75; // <<— reduce el intervalo en este factor

	// ======== CÁLCULOS REACTIVOS ========
	$: arr = Array.isArray($partidos) ? $partidos : [];
	$: a = arr.find((p) => p.id === FINALISTA_A_ID) ?? {
		votos: 0,
		color: '#4AA5A3',
		name: 'Finalista A'
	};
	$: b = arr.find((p) => p.id === FINALISTA_B_ID) ?? {
		votos: 0,
		color: '#F06B66',
		name: 'Finalista B'
	};
	$: nu = $nulo ?? { votos: 0 };

	const nf = new Intl.NumberFormat('en-US');
	const fmtPct = (num) => {
		const totalValid = (a.votos ?? 0) + (b.votos ?? 0); // solo para demo
		return totalValid ? ((num / totalValid) * 100).toFixed(1) : '0.0';
	};

	// Nulo: límites (min 3.5% de emitidos, max baseline)
	$: emi = +$emitidos || 0;
	$: bl = +($blanco?.votos || 0);
	$: nBase = ($nulo?.baseVotos ?? $nulo?.votos) || 0;
	$: nMin = Math.round(emi * 0.035);
	$: nMax = nBase;

	// ======== HELPERS DE MUTACIÓN ========
	function clamp(v, lo, hi) {
		return Math.max(lo, Math.min(hi, v));
	}

	// Mueve delta entre Nulo y PDC/LIBRE según signo
	function moveBetween(id, delta) {
		partidos.update((curr) => {
			const next = curr.map((p) => ({ ...p }));

			const ix = next.findIndex((p) => p.id === id);
			if (ix === -1) return curr;

			// estado actual
			const vA = next.find((p) => p.id === FINALISTA_A_ID)?.votos ?? 0;
			const vB = next.find((p) => p.id === FINALISTA_B_ID)?.votos ?? 0;
			const vN = $nulo?.votos ?? 0;

			if (delta > 0) {
				// + hacia el finalista: RESTAR desde Nulo hasta nMin
				const canTake = Math.max(0, vN - nMin);
				const take = Math.min(delta, canTake);
				next[ix].votos =
					vA && id === FINALISTA_A_ID
						? vA + take
						: vB && id === FINALISTA_B_ID
							? vB + take
							: (next[ix].votos ?? 0) + take;
				nulo.set({ ...$nulo, votos: vN - take });
			} else if (delta < 0) {
				// - desde el finalista: SUMAR a Nulo hasta nMax
				const fv = next[ix].votos ?? 0;
				const give = Math.min(fv, -delta);
				const canPut = Math.max(0, nMax - ($nulo?.votos ?? 0));
				const put = Math.min(give, canPut);
				next[ix].votos = fv - put;
				nulo.set({ ...$nulo, votos: ($nulo?.votos ?? 0) + put });
			}

			return next;
		});

		// recalcular pcts/KPIs/termómetro
		recomputeAll();
	}

	// ======== PRESS-AND-HOLD REPETIDOR ========
	function createRepeater(cb) {
		let h,
			interval = START_INTERVAL,
			ticks = 0,
			active = true;

		const step = () => {
			if (!active) return;
			cb();
			ticks++;
			if (ticks % ACCEL_EVERY === 0) {
				interval = Math.max(MIN_INTERVAL, Math.floor(interval * ACCEL_FACTOR));
			}
			h = setTimeout(step, interval);
		};

		// primer tick inmediato + agenda siguiente
		cb();
		h = setTimeout(step, interval);

		return () => {
			active = false;
			clearTimeout(h);
		};
	}

	// ======== GESTORES DE BOTONES ========
	let stopAPlus, stopAMinus, stopBPlus, stopBMinus;

	function onPress(id, dir) {
		// dir: +1 (sumar al finalista desde Nulo) | -1 (restar al finalista hacia Nulo)
		const delta = () => moveBetween(id, dir * STEP);
		return createRepeater(delta);
	}

	// Accesibilidad (enter/space)
	function keyRepeat(e, id, dir, setter) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (!setter) return;
			setter(onPress(id, dir));
		}
	}

	const barWidth = (v) => `${clamp((v / AXIS_MAX) * 100, 0, 100)}%`;
</script>

<div class="rounded-2xl bg-white p-3 ring-1 ring-gray-200 sm:p-4">
	<h3 class="mb-3 text-center text-base font-semibold text-gray-700 sm:text-lg">
		Demo móvil: transferencia Nulo ↔ Finalistas
	</h3>

	<!-- Barra PDC -->
	<div class="mb-3">
		<div class="mb-1 flex items-center justify-between">
			<span class="text-sm font-medium text-gray-700">{a.name ?? 'PDC'}</span>
			<span class="text-sm text-gray-600 tabular-nums"
				>{nf.format(a.votos ?? 0)} votos · {fmtPct(a.votos)}%</span
			>
		</div>
		<div class="flex items-center gap-2">
			<!-- Botones -->
			<div class="flex items-center gap-1">
				<button
					class="tap-manipulation rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 active:scale-[0.98]"
					aria-label="Restar a PDC"
					on:pointerdown={() => (stopAMinus = onPress(FINALISTA_A_ID, -1))}
					on:pointerup={() => stopAMinus?.()}
					on:pointercancel={() => stopAMinus?.()}
					on:keydown={(e) => keyRepeat(e, FINALISTA_A_ID, -1, (s) => (stopAMinus = s))}
					on:keyup={() => stopAMinus?.()}>–</button
				>
				<button
					class="tap-manipulation rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 active:scale-[0.98]"
					aria-label="Sumar a PDC desde Nulo"
					on:pointerdown={() => (stopAPlus = onPress(FINALISTA_A_ID, +1))}
					on:pointerup={() => stopAPlus?.()}
					on:pointercancel={() => stopAPlus?.()}
					on:keydown={(e) => keyRepeat(e, FINALISTA_A_ID, +1, (s) => (stopAPlus = s))}
					on:keyup={() => stopAPlus?.()}>+</button
				>
			</div>

			<!-- Barra -->
			<div class="relative h-8 w-full overflow-hidden rounded-md ring-1 ring-gray-200">
				<div
					class="absolute inset-0"
					style="background: linear-gradient(90deg, rgba(0,0,0,0.04), transparent 30%);"
				></div>
				<div
					class="h-full"
					style="width:{barWidth(a.votos ?? 0)}; background:{a.color ?? '#4AA5A3'};"
				></div>
			</div>
		</div>
	</div>

	<!-- Barra LIBRE -->
	<div class="mb-3">
		<div class="mb-1 flex items-center justify-between">
			<span class="text-sm font-medium text-gray-700">{b.name ?? 'LIBRE'}</span>
			<span class="text-sm text-gray-600 tabular-nums"
				>{nf.format(b.votos ?? 0)} votos · {fmtPct(b.votos)}%</span
			>
		</div>
		<div class="flex items-center gap-2">
			<div class="flex items-center gap-1">
				<button
					class="tap-manipulation rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 active:scale-[0.98]"
					aria-label="Restar a LIBRE"
					on:pointerdown={() => (stopBMinus = onPress(FINALISTA_B_ID, -1))}
					on:pointerup={() => stopBMinus?.()}
					on:pointercancel={() => stopBMinus?.()}
					on:keydown={(e) => keyRepeat(e, FINALISTA_B_ID, -1, (s) => (stopBMinus = s))}
					on:keyup={() => stopBMinus?.()}>–</button
				>
				<button
					class="tap-manipulation rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 active:scale-[0.98]"
					aria-label="Sumar a LIBRE desde Nulo"
					on:pointerdown={() => (stopBPlus = onPress(FINALISTA_B_ID, +1))}
					on:pointerup={() => stopBPlus?.()}
					on:pointercancel={() => stopBPlus?.()}
					on:keydown={(e) => keyRepeat(e, FINALISTA_B_ID, +1, (s) => (stopBPlus = s))}
					on:keyup={() => stopBPlus?.()}>+</button
				>
			</div>

			<div class="relative h-8 w-full overflow-hidden rounded-md ring-1 ring-gray-200">
				<div
					class="absolute inset-0"
					style="background: linear-gradient(90deg, rgba(0,0,0,0.04), transparent 30%);"
				></div>
				<div
					class="h-full"
					style="width:{barWidth(b.votos ?? 0)}; background:{b.color ?? '#F06B66'};"
				></div>
			</div>
		</div>
	</div>

	<!-- Barra NULO (solo display en este demo) -->
	<div>
		<div class="mb-1 flex items-center justify-between">
			<span class="text-sm font-medium text-gray-700">Nulo</span>
			<span class="text-sm text-gray-600 tabular-nums">{nf.format(nu.votos ?? 0)} votos</span>
		</div>
		<div class="relative h-5 w-full overflow-hidden rounded-md ring-1 ring-gray-200">
			<div
				class="absolute inset-0"
				style="background: linear-gradient(90deg, rgba(0,0,0,0.04), transparent 30%);"
			></div>
			<div class="h-full" style="width:{barWidth(nu.votos ?? 0)}; background:#111827;"></div>
		</div>
		<p class="mt-1 text-[11px] text-gray-500">
			Límite Nulo: min {nf.format(nMin)} · max {nf.format(nMax)} (se respeta al transferir).
		</p>
	</div>
</div>

<style>
	/* Evita zoom doble-tap y hace los botones más reactivos en móvil */
	.tap-manipulation {
		touch-action: manipulation;
	}
</style>
