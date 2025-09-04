<script>
	import { onMount, onDestroy } from 'svelte';

	// Colores
	const colorA = '#4AA5A3'; // PDC (barra)
	const colorA1 = '#469B99'; // PDC (texto)
	const colorB = '#F06B66'; // LIBRE (barra)
	const colorB1 = '#EE5D58'; // LIBRE (texto)

	// === PSEUDOBARRAS (otros + nulo) ===
	const BASE_POOL_AMPLIFY = 3.9;
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
	const TARGET = 49; // objetivo

	// Animación
	const PERIOD_MS = 9000;
	const EASE_POWER = 1.4;

	// Estado animado
	let pctA = A0;
	let pctB = B0;

	// Votos (demo)
	let votosA = 1_717_432;
	let votosB = 1_430_176;

	const nfUS = new Intl.NumberFormat('en-US');
	const fmt1 = (x) => (Number.isFinite(+x) ? (+x).toFixed(1) : '—');

	// Termómetro widths
	$: leftWidth = Math.max(0, Math.min(100, pctA));
	$: rightWidth = Math.max(0, Math.min(100, pctB));
	$: gapWidth = Math.max(0, 100 - (leftWidth + rightWidth)); // "disputables"

	// Bolsa “real” de partida (otros + nulo)
	const POOL0 = Math.max(0, 100 - (A0 + B0));

	// Progreso de transferencia 0→1
	$: deltaUp = Math.max(0, pctA + pctB - (A0 + B0));
	$: transferProgress = POOL0 > 0 ? Math.max(0, Math.min(1, deltaUp / POOL0)) : 0;

	// Pseudobarras con drenaje diferencial (solo apariencia)
	$: otherBars = OTHERS.map((o) => {
		const baseWidthPct = Math.min(100, POOL0 * BASE_POOL_AMPLIFY * (o.weight / TOTAL_WEIGHT));
		const drained = Math.max(0, 1 - o.drainSpeed * transferProgress);
		return { id: o.id, color: o.color, widthPct: baseWidthPct * drained };
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
		const half = PERIOD_MS / 2;
		const up = elapsed <= half;
		const uLinear = up ? elapsed / half : 1 - (elapsed - half) / half; // 0..1..0
		const u = easeInOutPow(uLinear, EASE_POWER);

		// Interpolación a TARGET y regreso
		pctA = A0 + (TARGET - A0) * u;
		pctB = B0 + (TARGET - B0) * u;

		// Votos (demo) con variación sutil
		const VA0 = 1_717_432,
			VB0 = 1_430_176;
		const AMP = 0.015;
		const shift = (uLinear - 0.5) * 2;
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

	// Mostrar votos dentro de barras si hay ancho suficiente
	const MIN_INSIDE_FOR_VOTES = 10;
	$: showVotesInsideLeft = leftWidth >= MIN_INSIDE_FOR_VOTES;
	$: showVotesInsideRight = rightWidth >= MIN_INSIDE_FOR_VOTES;
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
		<div
			class="mx-auto mt-8 max-w-3xl rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:p-5"
		>
			<!-- % grandes arriba (más pegados al termómetro) -->
			<div class="mb-1.5 flex items-end justify-between sm:mb-2">
				<div class="text-left">
					<div
						class="translate-y-[2px] text-5xl leading-none font-extrabold tabular-nums sm:text-6xl"
						style="color:{colorA1}"
					>
						{fmt1(pctA)}%
					</div>
				</div>
				<div class="text-right">
					<div
						class="translate-y-[2px] text-5xl leading-none font-extrabold tabular-nums sm:text-6xl"
						style="color:{colorB1}"
					>
						{fmt1(pctB)}%
					</div>
				</div>
			</div>

			<!-- Chip del gap (absoluto, no empuja nada) -->
			{#if gapWidth > 0.1}
				<div class="pointer-events-none relative">
					<div class="absolute -top-6 left-1/2 z-30 -translate-x-1/2">
						<span
							class="rounded bg-gray-100/80 px-2 py-0.5 text-[11px] font-medium text-gray-700 tabular-nums sm:text-xs"
						>
							{fmt1(gapWidth)}% disputables
						</span>
					</div>
				</div>
			{/if}

			<!-- Termómetro (estética nueva) -->
			<div class="relative h-12 w-full overflow-hidden rounded-md sm:h-12">
				<!-- Fondo neutro “sticky” con borde sutil -->
				<div
					class="absolute inset-0 z-0 rounded-[6px] bg-white/30 backdrop-blur-[1px]"
					style="box-shadow: inset 0 0 0 1px rgba(148,163,184,.4);"
				></div>

				<!-- Barra izquierda (encima, cubre al fondo) -->
				<div
					class="absolute inset-y-0 left-0 z-10"
					style="width:{leftWidth}%; background:{colorA}; border-top-left-radius:8px; border-bottom-left-radius:8px; transition: width 380ms cubic-bezier(0.22,0.61,0.36,1);"
					aria-label="Paz-Lara"
				></div>

				<!-- Barra derecha (encima, cubre al fondo) -->
				<div
					class="absolute inset-y-0 right-0 z-10"
					style="width:{rightWidth}%; background:{colorB}; border-top-right-radius:8px; border-bottom-right-radius:8px; transition: width 380ms cubic-bezier(0.22,0.61,0.36,1);"
					aria-label="Quiroga-Velasco"
				></div>

				<!-- Votos dentro/afuera: izquierda -->
				{#if showVotesInsideLeft}
					<div
						class="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-3"
						style="width:{leftWidth}%"
					>
						<span class="px-1 text-[12px] font-medium text-white tabular-nums sm:text-sm">
							{nfUS.format(votosA)} votos
						</span>
					</div>
				{:else}
					<div
						class="pointer-events-none absolute inset-y-0 z-20 flex items-center"
						style="left: calc({leftWidth}% + 6px)"
					>
						<span
							class="rounded-md bg-white px-2 py-0.5 text-[12px] font-semibold tabular-nums sm:text-sm"
							style="color:{colorA1}; box-shadow:0 1px 0 rgba(0,0,0,.04);"
						>
							{nfUS.format(votosA)}
						</span>
					</div>
				{/if}

				<!-- Votos dentro/afuera: derecha -->
				{#if showVotesInsideRight}
					<div
						class="pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center justify-end pr-3"
						style="width:{rightWidth}%"
					>
						<span class="px-1 text-[12px] font-medium text-white tabular-nums sm:text-sm">
							{nfUS.format(votosB)} votos
						</span>
					</div>
				{:else}
					<div
						class="pointer-events-none absolute inset-y-0 z-20 flex items-center"
						style="right: calc({rightWidth}% + 6px)"
					>
						<span
							class="rounded-md bg-white px-2 py-0.5 text-[12px] font-semibold tabular-nums sm:text-sm"
							style="color:{colorB1}; box-shadow:0 1px 0 rgba(0,0,0,.04);"
						>
							{nfUS.format(votosB)}
						</span>
					</div>
				{/if}

				<!-- Línea 50% -->
				<div
					class="absolute left-1/2 z-30 w-[2px] bg-gray-600"
					style="top:-6px; bottom:-6px;"
				></div>
			</div>

			<!-- Labels bajo el termómetro -->
			<div class="relative mt-2 h-5">
				<span
					class="absolute left-0 text-[12px] font-semibold tracking-tight sm:text-sm"
					style="color:{colorA1}"
				>
					Paz-Lara
				</span>
				<span
					class="absolute right-0 text-[12px] font-semibold tracking-tight sm:text-sm"
					style="color:{colorB1}"
				>
					Quiroga-Velasco
				</span>
				<h3 class="absolute left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600 sm:text-sm">
					Meta
				</h3>
			</div>

			<!-- Pseudobarras (otros + nulo) -->
			<div class="mt-5 space-y-2">
				{#each otherBars as ob}
					<div class="h-3 w-full overflow-hidden">
						<div
							class="h-full rounded-r-[3px]"
							style="width:{ob.widthPct}%; background:{ob.color}; transition: width 380ms cubic-bezier(0.22,0.61,0.36,1);"
						></div>
					</div>
				{/each}
			</div>
		</div>

		<!-- CTA -->
		<div class="mt-8 flex justify-center">
			<a
				href="/test"
				class="inline-flex cursor-pointer items-center gap-2 rounded-[5px] bg-gray-800 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 active:scale-[0.99]"
			>
				Comenzar
				<svg
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
