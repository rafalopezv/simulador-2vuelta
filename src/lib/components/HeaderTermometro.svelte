<script>
	import {
		pctA_valid,
		pctB_valid,
		partidos,
		FINALISTA_A_ID,
		FINALISTA_B_ID,
		destinoGlobal
	} from '$lib/stores/nuevo';

	import { spring, tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import NumberFlow from '@number-flow/svelte';
	import DestinationToggle from './DestinationToggle.svelte';

	// Colores marca
	const colorA = '#4AA5A3',
		colorA1 = '#4AA5A3';

	const colorB = '#F06B66',
		colorB1 = '#F06B66';

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

	// spring stores for bar widths (keep bouncy for bars)
	const leftWidthSpring = spring(0, {
		stiffness: 1 / 30,
		damping: 0.25
	});
	const rightWidthSpring = spring(0, {
		stiffness: 1 / 30,
		damping: 0.25
	});

	// tweened for percentages and vote counts (smooth, predictable)
	const aTweened = tweened(0, {
		duration: 300,
		easing: cubicOut
	});
	const bTweened = tweened(0, {
		duration: 300,
		easing: cubicOut
	});
	const votosATweened = tweened(0, {
		duration: 300,
		easing: cubicOut
	});
	const votosBTweened = tweened(0, {
		duration: 300,
		easing: cubicOut
	});
	const gapWidthTweened = tweened(0, {
		duration: 300,
		easing: cubicOut
	});

	// actualizar animaciones cuando cambian los valores
	$: leftWidthSpring.set(leftWidth);
	$: rightWidthSpring.set(rightWidth);
	$: aTweened.set(a);
	$: bTweened.set(b);
	$: votosATweened.set(votosA);
	$: votosBTweened.set(votosB);
	$: gapWidthTweened.set(gapWidth);

	// etiquetas dentro de barra
	const MIN_INSIDE_FOR_VOTES = 10;
	$: showVotesInsideLeft = leftWidth >= MIN_INSIDE_FOR_VOTES;
	$: showVotesInsideRight = rightWidth >= MIN_INSIDE_FOR_VOTES;

	// Formateador para números
	const nfUS = new Intl.NumberFormat('en-US');
</script>

<section class="w-full">
	<div class="mx-auto max-w-[1600px]">
		<div class="rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-200 sm:px-14 sm:py-4">
			<div class="relative">
				<!-- % GRANDES ARRIBA -->
				<div class="mb-1.5 flex items-end justify-between sm:mb-2">
					<div class="text-left">
						<div
							class="translate-y-[2px] text-4xl leading-none font-extrabold tabular-nums sm:text-5xl"
							style="color:{colorA1}"
						>
							{$aTweened.toFixed(1)}%
						</div>
					</div>
					<div class="text-right">
						<div
							class="translate-y-[2px] text-4xl leading-none font-extrabold tabular-nums sm:text-5xl"
							style="color:{colorB1}"
						>
							{$bTweened.toFixed(1)}%
						</div>
					</div>
				</div>

				<div class="absolute left-1/2 z-30 -translate-x-1/2 -translate-y-[60px]">
					<h3 class="text-base font-semibold text-gray-800 sm:text-lg">Resultados balotaje</h3>
				</div>

				<!-- TERMÓMETRO -->
				<div class="relative h-12 w-full overflow-hidden rounded-md sm:h-12">
					<!-- riel base -->
					<div class="absolute inset-0 rounded-md bg-gray-100"></div>

					<!-- barra izquierda -->
					<div
						class="absolute inset-y-0 left-0 z-10"
						style="width:{$leftWidthSpring}%; background:{colorA1}; border-top-left-radius:8px; border-bottom-left-radius:8px;"
						aria-label="Paz-Lara"
					></div>

					<!-- barra derecha -->
					<div
						class="absolute inset-y-0 right-0 z-10"
						style="width:{$rightWidthSpring}%; background:{colorB1}; border-top-right-radius:8px; border-bottom-right-radius:8px;"
						aria-label="Quiroga-Velasco"
					></div>

					<!-- VOTOS DENTRO/AFUERA -->
					{#if showVotesInsideLeft}
						<div
							class="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center pl-3"
							style="width:{$leftWidthSpring}%"
						>
							<span class="px-1 text-[12px] font-medium text-white tabular-nums sm:text-sm">
								{nfUS.format(Math.round($votosATweened))} votos
							</span>
						</div>
					{:else}
						<div
							class="pointer-events-none absolute inset-y-0 z-20 flex items-center"
							style="left: calc({$leftWidthSpring}% + 6px)"
						>
							<span
								class="rounded-md bg-white px-2 py-0.5 text-[12px] font-semibold tabular-nums sm:text-sm"
								style="color:{colorA1}; box-shadow:0 1px 0 rgba(0,0,0,.04);"
							>
								{nfUS.format(Math.round($votosATweened))}
							</span>
						</div>
					{/if}

					{#if showVotesInsideRight}
						<div
							class="pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center justify-end pr-3"
							style="width:{$rightWidthSpring}%"
						>
							<span class="px-1 text-[12px] font-medium text-white tabular-nums sm:text-sm">
								{nfUS.format(Math.round($votosBTweened))} votos
							</span>
						</div>
					{:else}
						<div
							class="pointer-events-none absolute inset-y-0 z-20 flex items-center"
							style="right: calc({$rightWidthSpring}% + 6px)"
						>
							<span
								class="rounded-md bg-white px-2 py-0.5 text-[12px] font-semibold tabular-nums sm:text-sm"
								style="color:{colorB1}; box-shadow:0 1px 0 rgba(0,0,0,.04);"
							>
								{nfUS.format(Math.round($votosBTweened))}
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
						class="absolute left-1/2 z-30 w-[1px] bg-[#333333]"
						style="top:-6px; bottom:-6px;"
					></div>
				</div>

				<!-- Etiquetas bajo el termómetro -->
				<div class="relative mt-0 h-12" style="--toggle-w: 48px; --gap: 10px;">
					<div
						class="absolute top-1/2 left-1/2 mt-2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
					>
						<DestinationToggle />
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
