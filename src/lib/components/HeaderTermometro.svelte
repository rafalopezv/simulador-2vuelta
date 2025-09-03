<script>
	// store wiring
	import {
		pctA_valid,
		pctB_valid,
		partidos,
		FINALISTA_A_ID,
		FINALISTA_B_ID
	} from '$lib/stores/nuevo';

	// brand colors
	const colorA = '#4AA5A3'; // PDC
	const colorA1 = '#469B99'; // PDC
	const colorB = '#F06B66'; // LIBRE
	const colorB1 = '#EE5D58'; // LIBRE

	// formatting
	const nfUS = new Intl.NumberFormat('en-US');
	const fmt1 = (x) => (Number.isFinite(+x) ? (+x).toFixed(1) : '—');

	// reactive % (over válidos)
	$: a = Math.max(0, Math.min(100, +$pctA_valid || 0));
	$: b = Math.max(0, Math.min(100, +$pctB_valid || 0));

	// reactive votes from store (fallback 0)
	$: votosA = $partidos?.find?.((p) => p.id === FINALISTA_A_ID)?.votos ?? 0;
	$: votosB = $partidos?.find?.((p) => p.id === FINALISTA_B_ID)?.votos ?? 0;

	// widths (dejan hueco si a+b<100)
	$: overlapSafe = Math.max(0, Math.min(100, a + b));
	$: leftWidth = a;
	$: rightWidth = b;
</script>

<section class="mx-auto mt-12 max-w-[1500px] rounded-xl bg-white p-2.5 shadow-sm sm:p-3">
	<div class="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-5">
		<div class="relative">
			<!-- fila superior: % grande y debajo votos (compacto y alineado) -->
			<div class="flex items-end justify-between">
				<!-- Izquierda (PDC) -->
				<div class="text-left">
					<div
						class="text-5xl leading-[1] font-extrabold tracking-tight tabular-nums sm:text-6xl"
						style="color:{colorA1}"
					>
						{fmt1(a)}%
					</div>
					<div class="mt-0.5 text-[11px] tabular-nums sm:text-xs" style="color:{colorA1}">
						{nfUS.format(votosA)} votos
					</div>
				</div>

				<!-- Derecha (LIBRE) -->
				<div class="flex flex-col items-end justify-end text-right">
					<div
						class="text-5xl leading-[1] font-extrabold tracking-tight tabular-nums sm:text-6xl"
						style="color:{colorB1}"
					>
						{fmt1(b)}%
					</div>
					<div
						class="mt-0.5 inline-block text-right text-[11px] tabular-nums sm:text-xs"
						style="color:{colorB1}"
					>
						{nfUS.format(votosB)} votos
					</div>
				</div>
			</div>

			<!-- termómetro (pegado a los números) -->
			<div class="mt-1 sm:mt-2">
				<div class="relative h-10 w-full overflow-hidden rounded-md sm:h-10">
					<!-- riel -->
					<div
						class="absolute inset-0 rounded-md bg-gray-100"
						style="
						background: repeating-linear-gradient(
							45deg,
							#cbd5e1,      
							#cbd5e1 2px,
							#64748b 2px,  
							#64748b 4px
						  );
						  opacity: 0.4;"
					></div>

					<!-- barra izquierda -->
					<div
						class="absolute inset-y-0 left-0 z-10"
						style="
                width:{leftWidth}%;
                background:{colorA1};
                border-top-left-radius:8px;
                border-bottom-left-radius:8px;
                transition: width 220ms cubic-bezier(0.22,0.61,0.36,1);
              "
					></div>

					<!-- barra derecha -->
					<div
						class="absolute inset-y-0 right-0 z-10"
						style="
                width:{rightWidth}%;
                background:{colorB1};
                border-top-right-radius:8px;
                border-bottom-right-radius:8px;
                transition: width 220ms cubic-bezier(0.22,0.61,0.36,1);
              "
					></div>

					<!-- línea 50% (ligeramente sobresaliente) -->
					<div class="absolute left-1/2 z-20 w-[2px] bg-white" style="top:-6px; bottom:-6px;"></div>
				</div>

				<!-- fila inferior: binomios a los lados y meta al centro -->

				<div class="relative mt-2 h-5">
					<!-- izquierda -->
					<span
						class="absolute left-0 text-[12px] font-semibold tracking-tight sm:text-sm"
						style="color:{colorA1}"
					>
						Paz-Lara
					</span>

					<!-- derecha -->
					<span
						class="absolute right-0 text-[12px] font-semibold tracking-tight sm:text-sm"
						style="color:{colorB1}"
					>
						Quiroga-Velasco
					</span>

					<!-- meta centrada justo bajo la línea 50% -->
					<h2
						class="absolute left-1/2 -translate-x-1/2 text-xs font-semibold tracking-tight text-gray-600 sm:text-sm"
					>
						50% + 1 voto
					</h2>
				</div>
			</div>
		</div>
	</div>
</section>
