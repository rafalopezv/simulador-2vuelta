<script>
	import { onMount, onDestroy } from 'svelte';

	// Colores consistentes con tu app
	const colorA = '#4AA5A3'; // PDC
	const colorA1 = '#469B99'; // PDC
	const colorB = '#F06B66'; // LIBRE
	const colorB1 = '#EE5D58'; // LIBRE

	// === CONTROLES VISUALES PARA LAS PSEUDOBARRAS ===
	// Amplifica el “llenado” inicial (solo apariencia). 1.0 = tal cual, 1.3 = 30% más anchas al inicio
	const BASE_POOL_AMPLIFY = 3.9;

	// Otros partidos + Nulo: peso relativo (reparto) y velocidad de drenaje
	// drainSpeed: 1.0 normal, >1 más rápido, <1 más lento
	const OTHERS = [
		{ id: 'AP', color: '#66BEE5', weight: 0.16, drainSpeed: 1.1 },
		{ id: 'LYP', color: '#444444', weight: 0.08, drainSpeed: 0.9 },
		{ id: 'APB', color: '#8E66C4', weight: 0.13, drainSpeed: 1.2 },
		{ id: 'FP', color: '#A9E4F3', weight: 0.06, drainSpeed: 0.95 },
		{ id: 'MAS', color: '#3E5FA8', weight: 0.1, drainSpeed: 1.15 },
		{ id: 'UNI', color: '#F6C95C', weight: 0.22, drainSpeed: 1.25 },
		{ id: 'NUL', color: '#111827', weight: 0.25, drainSpeed: 1.4 }
	];
	const TOTAL_WEIGHT = OTHERS.reduce((s, o) => s + o.weight, 0);

	// Estado inicial y meta
	const A0 = 32.0; // PDC arranque
	const B0 = 26.0; // LIBRE arranque
	const TARGET = 49; // objetivo al que suben y del que bajan

	// ---- CONTROLES DE ANIMACIÓN ----
	const PERIOD_MS = 9000; // duración total del loop (ajusta velocidad)
	const EASE_POWER = 1.4; // 1 = lineal, 2–3 = ease-in-out más suave

	// Estado animado
	let pctA = A0;
	let pctB = B0;

	// Votos: variación sutil para acompañar
	let votosA = 1_717_432;
	let votosB = 1_430_176;

	// Formato
	const nfUS = new Intl.NumberFormat('en-US');
	const fmt1 = (x) => (Number.isFinite(+x) ? (+x).toFixed(1) : '—');

	// Termómetro
	$: leftWidth = Math.max(0, Math.min(100, pctA));
	$: rightWidth = Math.max(0, Math.min(100, pctB));
	$: gapWidthPct = Math.max(0, 100 - (leftWidth + rightWidth));

	// Bolsa “real” de partida (otros + nulo)
	const POOL0 = Math.max(0, 100 - (A0 + B0));

	// Progreso de transferencia (0 → 1): cuánto de la bolsa ya se vació hacia PDC/LIBRE
	$: deltaUp = Math.max(0, pctA + pctB - (A0 + B0));
	$: transferProgress = POOL0 > 0 ? Math.max(0, Math.min(1, deltaUp / POOL0)) : 0;

	// Pseudobarras: base más cargada + drenaje diferencial
	// baseWidthPct: ancho inicial amplificado; luego se multiplica por (1 - drainSpeed * progress)
	$: otherBars = OTHERS.map((o) => {
		const baseWidthPct = Math.min(100, POOL0 * BASE_POOL_AMPLIFY * (o.weight / TOTAL_WEIGHT));
		const drained = Math.max(0, 1 - o.drainSpeed * transferProgress);
		return {
			id: o.id,
			color: o.color,
			widthPct: baseWidthPct * drained
		};
	});

	// Easing ping-pong
	const clamp01 = (x) => Math.max(0, Math.min(1, x));
	const easeInOutPow = (u, k = 2) => {
		u = clamp01(u);
		return u < 0.5 ? 0.5 * Math.pow(u * 2, k) : 1 - 0.5 * Math.pow((1 - u) * 2, k);
	};

	let raf, start;
	function frame(ts) {
		if (start == null) start = ts;
		const elapsed = (ts - start) % PERIOD_MS;

		// Progreso 0→1→0
		const half = PERIOD_MS / 2;
		const up = elapsed <= half;
		const uLinear = up ? elapsed / half : 1 - (elapsed - half) / half; // 0..1..0
		const u = easeInOutPow(uLinear, EASE_POWER);

		// Interpolación a TARGET y de regreso
		pctA = A0 + (TARGET - A0) * u;
		pctB = B0 + (TARGET - B0) * u;

		// Votos con variación sutil
		const VA0 = 1_717_432,
			VB0 = 1_430_176;
		const AMP = 0.015; // ±1.5%
		const shift = (uLinear - 0.5) * 2; // -1..1
		votosA = Math.round(VA0 * (1 + AMP * shift));
		votosB = Math.round(VB0 * (1 + AMP * shift));

		raf = requestAnimationFrame(frame);
	}

	onMount(() => {
		raf = requestAnimationFrame(frame);
	});
	onDestroy(() => {
		if (raf) cancelAnimationFrame(raf);
	});
</script>

<section class="flex min-h-dvh items-center justify-center bg-white">
	<div class="w-full max-w-5xl px-4 py-10 sm:py-12">
		<!-- Header -->
		<header class="text-center">
			<h1
				class="text-3xl leading-tight font-extrabold tracking-[0.01em] text-gray-800 sm:text-4xl sm:leading-snug sm:tracking-[0.02em]"
			>
				Simulador de segunda vuelta electoral en Bolivia
			</h1>
			<p class="mx-auto mt-3 max-w-2xl text-base text-gray-600 sm:text-lg">
				Arrastra las barras por partido de la primera vuelta y simula la segunda
			</p>
		</header>

		<!-- Demo card -->
		<div class="mx-auto mt-8 max-w-3xl rounded-xl bg-white p-4 ring-1 ring-gray-200 sm:p-5">
			<!-- % grandes + votos -->
			<div class="flex items-end justify-between">
				<!-- Izquierda -->
				<div class="text-left">
					<div
						class="text-5xl leading-[1] font-extrabold tracking-tight tabular-nums sm:text-6xl"
						style="color:{colorA1}"
					>
						{fmt1(pctA)}%
					</div>
					<div class="mt-0.5 text-[11px] tabular-nums sm:text-xs" style="color:{colorA1}">
						{nfUS.format(votosA)} votos
					</div>
				</div>

				<!-- Derecha -->
				<div class="flex flex-col items-end justify-end text-right">
					<div
						class="text-5xl leading-[1] font-extrabold tracking-tight tabular-nums sm:text-6xl"
						style="color:{colorB1}"
					>
						{fmt1(pctB)}%
					</div>
					<div class="mt-0.5 text-[11px] tabular-nums sm:text-xs" style="color:{colorB1}">
						{nfUS.format(votosB)} votos
					</div>
				</div>
			</div>

			<!-- Termómetro -->
			<div class="mt-2 sm:mt-3">
				<div class="relative h-10 w-full overflow-hidden rounded-md">
					<!-- riel base -->
					<div class="absolute inset-0 rounded-md bg-gray-100"></div>

					<!-- barra izquierda -->
					<div
						class="absolute inset-y-0 left-0 z-10"
						style="
				width:{leftWidth}%;
				background:{colorA};
				border-top-left-radius:8px;
				border-bottom-left-radius:8px;
				transition: width 380ms cubic-bezier(0.22,0.61,0.36,1);
			  "
					></div>

					<!-- barra derecha -->
					<div
						class="absolute inset-y-0 right-0 z-10"
						style="
				width:{rightWidth}%;
				background:{colorB};
				border-top-right-radius:8px;
				border-bottom-right-radius:8px;
				transition: width 380ms cubic-bezier(0.22,0.61,0.36,1);
			  "
					></div>

					<!-- gap central con rayas (solo si hay espacio) -->
					<div
						class="absolute inset-0 z-0"
						style="
      background:
        repeating-linear-gradient(
          45deg,
          #cbd5e1, #cbd5e1 2px,
          #64748b, #64748b 4px
        );
      opacity: {gapWidthPct > 0.05 ? 0.4 : 0};
      transition: opacity 200ms ease-out;
    "
					></div>

					<!-- línea 50% (sobresale) -->
					<div class="absolute left-1/2 z-20 w-[2px] bg-white" style="top:-8px; bottom:-8px;"></div>
				</div>

				<!-- Etiquetas bajo el termómetro -->
				<div class="relative mt-2 h-5">
					<span
						class="absolute left-0 text-[12px] font-semibold tracking-tight sm:text-sm"
						style="color:{colorA}"
					>
						Paz-Lara
					</span>
					<span
						class="absolute right-0 text-[12px] font-semibold tracking-tight sm:text-sm"
						style="color:{colorB}"
					>
						Quiroga-Velasco
					</span>
					<h3
						class="pointer-events-none absolute left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600 sm:text-sm"
					>
						50% + 1 voto
					</h3>
				</div>
			</div>

			<!-- Pseudobarras: “otros partidos + nulo” con drenaje diferencial -->

			<div class="mt-5 space-y-2">
				{#each otherBars as ob}
					<div class="h-3 w-full overflow-hidden">
						<div
							class="h-full rounded-r-[3px]"
							style="
			width:{ob.widthPct}%;
			background:{ob.color};
			transition: width 380ms cubic-bezier(0.22,0.61,0.36,1);
		  "
						></div>
					</div>
				{/each}
			</div>
		</div>

		<!-- CTA -->
		<div class="mt-8 flex justify-center">
			<a
				href="/sim"
				class="inline-flex cursor-pointer items-center gap-2 rounded-[5px] bg-gray-800 px-6 py-3 text-base font-semibold
		  text-white shadow-sm transition hover:bg-gray-900 focus:outline-none focus-visible:ring-2
		  focus-visible:ring-gray-400 active:scale-[0.99]"
			>
				Comenzar <svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4 opacity-90"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path d="M13.172 12L8.222 7.05l1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
				</svg>
			</a>
		</div>

		<p class="mt-6 text-center text-xs text-gray-500">Basado en resultados oficiales</p>
	</div>
</section>

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
	}
</style>
