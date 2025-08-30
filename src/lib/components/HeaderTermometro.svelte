<script>
	import { pctA_valid, pctB_valid } from '$lib/stores/sim';

	export let votosA = 0;
	export let votosB = 0;

	const colorA = '#4AA5A3'; // PDC
	const colorA1 = '#397F7F'; // PDC
	const colorB = '#F06B66'; // LIBRE
	const colorB1 = '#EB3933'; // LIBRE

	const asNum = (x) => (Number.isFinite(+x) ? +x : 0);
	const fmt1 = (x) => (Number.isFinite(+x) ? (+x).toFixed(1) : '—');
	const nf = new Intl.NumberFormat('es-BO');

	$: a = asNum($pctA_valid);
	$: b = asNum($pctB_valid);

	// 🔑 Reparto relativo entre los finalistas (suma 100% siempre)
	$: totalAB = a + b;
	$: leftShare = totalAB > 0 ? (a / totalAB) * 100 : 0; // % para ancho PDC
	$: rightShare = 100 - leftShare; // % para ancho LIBRE
</script>

<section class="mx-auto mt-16 max-w-[1500px] rounded-xl bg-white p-2.5 shadow-sm sm:p-3">
	<div class="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
		<!-- <h1 class="mt-0 mb-3 text-center text-xl font-bold text-[#333333]">Resultados (2ª vuelta)</h1> -->

		<!-- % grandes a los lados -->
		<div class="relative">
			<div class="flex items-end justify-between">
				<!-- Izquierda (PDC) -->
				<div class="text-left">
					<div
						class="text-4xl leading-none font-extrabold tracking-tight sm:text-5xl"
						style="color:{colorA1}"
					>
						{fmt1(a)}%
					</div>
					<div class="mt-1 text-[11px] text-gray-600 sm:text-xs">
						{nf.format(votosA)} votos
					</div>
				</div>

				<!-- Meta centrada -->
				<div class="absolute left-1/2 -translate-x-1/2 text-center">
					<h2 class="text-sm font-semibold tracking-tight text-gray-900 sm:text-base">
						50% + 1 voto
					</h2>
				</div>

				<!-- Derecha (LIBRE) -->
				<div class="text-right">
					<div
						class="text-4xl leading-none font-extrabold tracking-tight sm:text-5xl"
						style="color:{colorB1}"
					>
						{fmt1(b)}%
					</div>
					<div class="mt-1 text-[11px] text-gray-600 sm:text-xs">
						{nf.format(votosB)} votos
					</div>
				</div>
			</div>

			<!-- Termómetro -->
			<div class="mt-3 sm:mt-4">
				<div class="relative h-10 w-full overflow-hidden rounded-md sm:h-10">
					<!-- Riel base gris a todo lo ancho -->
					<div class="absolute inset-0 rounded-md bg-gray-100"></div>

					<!-- Barra izquierda (PDC) -->
					<div
						class="absolute inset-y-0 left-0 z-10"
						style="
                width:{leftShare}%;
                background:{colorA};
                border-top-left-radius:8px;
                border-bottom-left-radius:8px;
                transition:width 300ms cubic-bezier(0.22,0.61,0.36,1);
              "
					></div>

					<!-- Barra derecha (LIBRE) -->
					<div
						class="absolute inset-y-0 right-0 z-10"
						style="
                width:{rightShare}%;
                background:{colorB};
                border-top-right-radius:8px;
                border-bottom-right-radius:8px;
                transition:width 300ms cubic-bezier(0.22,0.61,0.36,1);
              "
					></div>

					<!-- Línea 50% (gris sutil, sobresale arriba/abajo) -->
					<div
						class="absolute left-1/2 z-20 w-[2px] bg-gray-500/70"
						style="top:-6px; bottom:-6px;"
					></div>

					<!-- Etiqueta 50% -->
					<div class="absolute -top-5 left-1/2 z-30 -translate-x-1/2 sm:-top-6">
						<span
							class="rounded-md bg-white px-2 py-0.5 text-[10px] text-gray-800 tabular-nums shadow-sm ring-1 ring-gray-300 sm:text-xs"
						>
							50%
						</span>
					</div>
				</div>

				<!-- Binomios -->
				<div class="mt-2 flex items-center justify-between">
					<span class="text-[12px] font-semibold tracking-tight sm:text-sm" style="color:{colorA1}">
						Paz-Lara
					</span>
					<span class="text-[12px] font-semibold tracking-tight sm:text-sm" style="color:{colorB1}">
						Quiroga-Velasco
					</span>
				</div>
			</div>
		</div>
	</div>
</section>
