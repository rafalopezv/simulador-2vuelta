<script>
	// ===== Config del eje =====
	const AXIS_MAX = 2_500_000;
	const TICK_STEP = 500_000;
	const ticks = Array.from({ length: AXIS_MAX / TICK_STEP + 1 }, (_, i) => i * TICK_STEP);

	const nf = new Intl.NumberFormat('es-BO');
	const pf = (x) => `${x.toFixed(2)}%`;

	// ===== Estado (demo) =====
	const TOTAL = 2_400_000; // 1.2M + 1.2M
	let a = 1_200_000;
	let b = TOTAL - a;

	// Porcentajes sobre el TOTAL (para este dummy)
	$: pctA = (100 * a) / TOTAL;
	$: pctB = (100 * b) / TOTAL;

	// ---- helpers
	const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
	const frac = (v) => (AXIS_MAX ? clamp(v / AXIS_MAX, 0, 1) : 0); // 0..1 para ancho

	// ==== Drag handlers por barra ====
	// Para la barra A: el valor de A se ajusta al puntero, y B = TOTAL - A
	let laneA;
	let draggingA = false;
	function clientXToValue(el, clientX) {
		const rect = el.getBoundingClientRect();
		const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
		return Math.round(ratio * AXIS_MAX);
	}
	function onDownA(e) {
		draggingA = true;
		laneA.setPointerCapture?.(e.pointerId);
		onMoveA(e);
	}
	function onMoveA(e) {
		if (!draggingA) return;
		const raw = clientXToValue(laneA, e.clientX);
		// Conservamos TOTAL: A <= TOTAL y >= 0
		const newA = clamp(raw, 0, TOTAL);
		a = newA;
		b = TOTAL - newA; // reacción inmediata
	}
	function onUpA(e) {
		draggingA = false;
		laneA.releasePointerCapture?.(e.pointerId);
	}

	// Para la barra B: igual lógica (TOTAL fijo)
	let laneB;
	let draggingB = false;
	function onDownB(e) {
		draggingB = true;
		laneB.setPointerCapture?.(e.pointerId);
		onMoveB(e);
	}
	function onMoveB(e) {
		if (!draggingB) return;
		const raw = clientXToValue(laneB, e.clientX);
		const newB = clamp(raw, 0, TOTAL);
		b = newB;
		a = TOTAL - newB; // reacción inmediata
	}
	function onUpB(e) {
		draggingB = false;
		laneB.releasePointerCapture?.(e.pointerId);
	}

	// Estética
	const labelW = '7rem';
	const colorA = '#4AA5A3';
	const colorB = '#F06B66';
</script>

<section class="w-full px-2 sm:px-4">
	<div class="rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-200 sm:p-4">
		<h3 class="mb-4 text-center text-base font-semibold text-gray-900 sm:text-lg">
			Dummy: 2 barras reactivas (TOTAL fijo)
		</h3>

		<div class="relative" style="--label-w:{labelW}">
			<!-- Guías del eje (alineadas y fijas) -->
			<div class="pointer-events-none absolute inset-0" style="left: calc({labelW} + 0.75rem);">
				<div class="relative h-full">
					{#each ticks as t}
						<div
							class="absolute top-0 bottom-0 border-l border-solid border-gray-200"
							style="left: {(t / AXIS_MAX) * 100}%; z-index: 0;"
						></div>
					{/each}
				</div>
			</div>

			<!-- === Fila A === -->
			<div
				class="grid items-center gap-3 sm:gap-3"
				style="grid-template-columns: var(--label-w, 7rem) 1fr;"
			>
				<div class="w-full truncate pr-1 text-right text-xs font-medium text-gray-800 sm:text-sm">
					A
				</div>

				<div
					bind:this={laneA}
					class="relative h-12 sm:h-12"
					on:pointerdown={onDownA}
					on:pointermove={onMoveA}
					on:pointerup={onUpA}
					on:pointercancel={onUpA}
					on:lostpointercapture={onUpA}
				>
					<!-- Barra -->
					<div
						class="absolute inset-y-1 left-1 rounded-r-[5px]"
						style="
                width: calc({frac(a) * 100}% - 0.25rem);
                background: {colorA};
                transition: width 120ms linear; /* se nota suave sin retraso al drag */
              "
					></div>

					<!-- Etiqueta al final de la barra -->
					<div
						class="pointer-events-none absolute top-1/2 text-[12px] font-semibold tabular-nums sm:text-sm"
						style="
                left: {frac(a) * 100}%;
                transform: translate(6px, -55%);
                color: #111827;
                white-space: nowrap;
              "
					>
						{nf.format(a)} · {pf(pctA)}
					</div>

					<!-- capa “hit” para drag cómodo -->
					<div class="absolute inset-0 z-10 cursor-ew-resize select-none"></div>
				</div>
			</div>

			<!-- === Fila B === -->
			<div
				class="mt-2 grid items-center gap-3 sm:mt-2 sm:gap-3"
				style="grid-template-columns: var(--label-w, 7rem) 1fr;"
			>
				<div class="w-full truncate pr-1 text-right text-xs font-medium text-gray-800 sm:text-sm">
					B
				</div>

				<div
					bind:this={laneB}
					class="relative h-12 sm:h-12"
					on:pointerdown={onDownB}
					on:pointermove={onMoveB}
					on:pointerup={onUpB}
					on:pointercancel={onUpB}
					on:lostpointercapture={onUpB}
				>
					<!-- Barra -->
					<div
						class="absolute inset-y-1 left-1 rounded-r-[5px]"
						style="
                width: calc({frac(b) * 100}% - 0.25rem);
                background: {colorB};
                transition: width 120ms linear;
              "
					></div>

					<!-- Etiqueta -->
					<div
						class="pointer-events-none absolute top-1/2 text-[12px] font-semibold tabular-nums sm:text-sm"
						style="
                left: {frac(b) * 100}%;
                transform: translate(6px, -55%);
                color: #111827;
                white-space: nowrap;
              "
					>
						{nf.format(b)} · {pf(pctB)}
					</div>

					<div class="absolute inset-0 z-10 cursor-ew-resize select-none"></div>
				</div>
			</div>

			<!-- Etiquetas del eje -->
			<div class="mt-3 grid" style="grid-template-columns: {labelW} 1fr;">
				<div></div>
				<div class="relative h-4" style="margin-left: 0.75rem;">
					{#each ticks as t, i}
						<span
							class="absolute font-mono text-[10px] text-gray-500 tabular-nums sm:text-xs"
							style="
                  left: {(t / AXIS_MAX) * 100}%;
                  --pad: 4px;
                  transform: {i === ticks.length - 1
								? 'translateX(calc(-100% - var(--pad)))'
								: 'translateX(var(--pad))'};
                  text-align: {i === ticks.length - 1 ? 'right' : 'left'};
                  white-space: nowrap;
                "
						>
							{nf.format(t)}
						</span>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* evita “salto” visual al arrastrar rápido */
	.tabular-nums {
		font-variant-numeric: tabular-nums;
	}
</style>
