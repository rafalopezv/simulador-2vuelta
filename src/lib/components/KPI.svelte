<script>
	import { kpis } from '$lib/stores/nuevo';

	const asNum = (x) => (Number.isFinite(+x) ? +x : 0);

	// Formateadores en-US (miles con coma, decimales con punto)
	const nf = new Intl.NumberFormat('en-US');
	const nf1 = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	});
	const fmtPct = (x) => (Number.isFinite(+x) ? `${nf1.format(+x)}%` : '—');

	const defaultKPIs = {
		validos: { votos: 0, pctEmit: 0 },
		emitidos: { votos: 0, pctHabilitados: 0 },
		nulos: { votos: 0, pctEmit: 0 },
		habilitados: 0
	};

	$: data = $kpis ?? defaultKPIs;
</script>

<!-- grid contenedor -->
<div class="grid w-full grid-cols-2 gap-3 sm:gap-4">
	<!-- Válidos -->
	<div
		class="flex min-h-24 flex-col items-center justify-center rounded-xl bg-white p-3 text-center shadow-sm
             transition duration-300 ease-out hover:scale-105 hover:shadow-md"
	>
		<div class="text-[11px] font-medium text-gray-900 sm:text-xs">Votos válidos</div>
		<div class="text-lg font-semibold text-[#333333] sm:text-xl">
			{nf.format(asNum(data.validos?.votos))}
		</div>
		<div class="text-[11px] text-gray-500 sm:text-xs">
			{fmtPct(data.validos?.pctEmit)}
		</div>
	</div>

	<!-- Emitidos -->
	<div
		class="flex min-h-24 flex-col items-center justify-center rounded-xl bg-white p-3 text-center shadow-sm
             transition duration-300 ease-out hover:scale-105 hover:shadow-md"
	>
		<div class="text-[11px] font-medium text-gray-900 sm:text-xs">Votos emitidos</div>
		<div class="text-lg font-semibold text-gray-900 sm:text-xl">
			{nf.format(asNum(data.emitidos?.votos))}
		</div>
		<div class="text-[11px] text-gray-500 sm:text-xs">
			{fmtPct(data.emitidos?.pctHabilitados)}
		</div>
	</div>

	<!-- Nulos -->
	<div
		class="flex min-h-24 flex-col items-center justify-center rounded-xl bg-white p-3 text-center shadow-sm
             transition duration-300 ease-out hover:scale-105 hover:shadow-md"
	>
		<div class="text-[11px] font-medium text-gray-900 sm:text-xs">Votos nulos</div>
		<div class="text-lg font-semibold text-gray-900 sm:text-xl">
			{fmtPct(data.nulos?.pctEmit)}
		</div>
		<div class="text-[11px] text-gray-500 sm:text-xs">
			{nf.format(asNum(data.nulos?.votos))}
		</div>
	</div>

	<!-- Habilitados -->
	<div
		class="flex min-h-24 flex-col items-center justify-center rounded-xl bg-white p-3 text-center shadow-sm
             transition duration-300 ease-out hover:scale-105 hover:shadow-md"
	>
		<div class="text-[11px] font-medium text-gray-900 sm:text-xs">Habilitados</div>
		<div class="text-lg font-semibold text-gray-900 sm:text-xl">
			{nf.format(asNum(data.habilitados))}
		</div>
	</div>
</div>
