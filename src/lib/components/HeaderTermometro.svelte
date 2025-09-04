<script>
	import {
		pctA_valid,
		pctB_valid,
		partidos,
		FINALISTA_A_ID,
		FINALISTA_B_ID
	} from '$lib/stores/nuevo';

	// Colores marca
	const colorA = '#4AA5A3',
		colorA1 = '#469B99';
	const colorB = '#F06B66',
		colorB1 = '#EE5D58';

	// Formatos
	const nfUS = new Intl.NumberFormat('en-US');
	const fmt1 = (x) => (Number.isFinite(+x) ? (+x).toFixed(1) : '—');

	// % (sobre válidos)
	$: a = Math.max(0, Math.min(100, +$pctA_valid || 0));
	$: b = Math.max(0, Math.min(100, +$pctB_valid || 0));

	// votos
	$: votosA = $partidos?.find?.((p) => p.id === FINALISTA_A_ID)?.votos ?? 0;
	$: votosB = $partidos?.find?.((p) => p.id === FINALISTA_B_ID)?.votos ?? 0;

	// anchos
	$: leftWidth = a;
	$: rightWidth = b;
	$: gapWidth = Math.max(0, 100 - (leftWidth + rightWidth));

	// Reglas de visibilidad de etiquetas dentro de barra
	const MIN_INSIDE_FOR_VOTES = 10; // % mínimo de ancho para meter los votos dentro
	$: showVotesInsideLeft = leftWidth >= MIN_INSIDE_FOR_VOTES;
	$: showVotesInsideRight = rightWidth >= MIN_INSIDE_FOR_VOTES;
</script>

<section class="w-full">
	<div class="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
		<div class="rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-200 sm:p-4">
			<div class="relative">
				<!-- % GRANDES ARRIBA -->

				<div class="mb-1.5 flex items-end justify-between sm:mb-2">
					<div class="text-left">
						<div
							class="translate-y-[2px] text-4xl leading-none font-extrabold tabular-nums sm:text-5xl"
							style="color:{colorA1}"
						>
							{fmt1(a)}%
						</div>
					</div>
					<div class="text-right">
						<div
							class="translate-y-[2px] text-4xl leading-none font-extrabold tabular-nums sm:text-5xl"
							style="color:{colorB1}"
						>
							{fmt1(b)}%
						</div>
					</div>
				</div>

				<!-- CHIP del gap: absoluto, no ocupa espacio -->
				{#if gapWidth > 0.1}
					<div
						class="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 translate-y-[-35px]"
					>
						<span
							class=" px-2 py-0.5 text-xs font-semibold tracking-tight text-gray-600 tabular-nums sm:text-sm"
						>
							{fmt1(gapWidth)}% disputables
						</span>
					</div>
				{/if}
				<!-- TERMÓMETRO -->
				<div class="relative h-12 w-full overflow-hidden rounded-md sm:h-12">
					<!-- Riel base -->
					<div class="absolute inset-0 rounded-md bg-gray-100"></div>

					<!-- Barra izquierda -->
					<div
						class="absolute inset-y-0 left-0 z-10"
						style="width:{leftWidth}%; background:{colorA1}; border-top-left-radius:8px; border-bottom-left-radius:8px; transition: width 240ms cubic-bezier(0.22,0.61,0.36,1);"
						aria-label="Paz-Lara"
					></div>

					<!-- barra derecha -->
					<div
						class="absolute inset-y-0 right-0 z-10"
						style="width:{rightWidth}%; background:{colorB1}; border-top-right-radius:8px; border-bottom-right-radius:8px; transition: width 240ms cubic-bezier(0.22,0.61,0.36,1);"
						aria-label="Quiroga-Velasco"
					></div>

					<!-- VOTOS DENTRO/AFUERA: IZQUIERDA -->
					{#if showVotesInsideLeft}
						<div
							class="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-3"
							style="width:{leftWidth}%"
						>
							<span class="px-1 text-[12px] font-medium text-white tabular-nums sm:text-sm"
								>{nfUS.format(votosA)} votos</span
							>
						</div>
					{:else}
						<div
							class="pointer-events-none absolute inset-y-0 z-20 flex items-center"
							style="left: calc({leftWidth}% + 6px)"
						>
							<span class="px-1 text-[12px] font-medium text-white tabular-nums sm:text-sm"
								>{nfUS.format(votosA)}</span
							>
						</div>
					{/if}

					{#if showVotesInsideRight}
						<div
							class="pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center justify-end pr-3"
							style="width:{rightWidth}%"
						>
							<span class="px-1 text-[12px] font-medium text-white tabular-nums sm:text-sm"
								>{nfUS.format(votosB)} votos</span
							>
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

					<!-- hueco central “vacío” -->
					<div class="pointer-events-none absolute inset-0 z-0">
						<div
							class="h-full w-full rounded-[6px] bg-white/30 backdrop-blur-[1px]"
							style="box-shadow: inset 0 0 0 1px rgba(148,163,184,.4);"
						></div>
					</div>
					<!-- Línea 50% -->
					<div
						class="absolute left-1/2 z-30 w-[2px] bg-gray-600"
						style="top:-6px; bottom:-6px;"
					></div>
				</div>

				<!-- Etiquetas bajo el termómetro -->
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
					<h2
						class="absolute left-1/2 -translate-x-1/2 text-xs font-semibold tracking-tight text-gray-600 sm:text-sm"
					>
						Meta
					</h2>
				</div>
			</div>
		</div>
	</div>
</section>
