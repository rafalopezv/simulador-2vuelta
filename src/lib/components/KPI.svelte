<script>
	import { kpis } from '$lib/stores/sim';

	const asNum = (x) => (Number.isFinite(+x) ? +x : 0);
	const pf = (x) => (Number.isFinite(+x) ? `${(+x).toFixed(1)}%` : '—');

	const defaultKPIs = {
		validos: { votos: 0, pctEmit: 0 },
		emitidos: { votos: 0, pctHabilitados: 0 },
		nulos: { votos: 0, pctEmit: 0 },
		habilitados: 0
	};

	$: data = $kpis ?? defaultKPIs;
	const nf = new Intl.NumberFormat('es-BO');
</script>

<div class="grid w-full grid-cols-2 gap-3 sm:gap-4">
	<!-- tarjeta -->
	<div
		class="transform rounded-xl border-gray-200 bg-white p-2.5 shadow-sm
		       transition duration-300 ease-out hover:scale-105 hover:shadow-md sm:p-3"
	>
		<div class="text-xs text-gray-900 transition-all duration-300">Votos válidos</div>
		<div
			class="font-mono text-lg font-semibold text-[#333333] transition-all duration-300 sm:text-xl"
		>
			{nf.format(asNum(data.validos?.votos))}
		</div>
		<div class="text-xs text-gray-500 transition-all duration-300">
			{pf(data.validos?.pctEmit)}
		</div>
	</div>

	<div
		class="transform rounded-xl border-gray-200 bg-white p-2.5 shadow-sm
		       transition duration-300 ease-out hover:scale-105 hover:shadow-md sm:p-3"
	>
		<div class="font-regular text-xs text-gray-900 transition-all duration-300">Votos emitidos</div>
		<div class="text-lg font-semibold text-gray-900 transition-all duration-300 sm:text-xl">
			{nf.format(asNum(data.emitidos?.votos))}
		</div>
		<div class="text-xs text-gray-500 transition-all duration-300">
			{pf(data.emitidos?.pctHabilitados)}
		</div>
	</div>

	<div
		class="transform rounded-xl border-gray-200 bg-white p-2.5 shadow-sm
		       transition duration-300 ease-out hover:scale-105 hover:shadow-md sm:p-3"
	>
		<div class="text-xs text-gray-900 transition-all duration-300">Votos nulos</div>
		<div class="text-lg font-semibold text-gray-900 transition-all duration-300 sm:text-xl">
			{pf(data.nulos?.pctEmit)}
		</div>
		<div class="text-xs text-gray-500 transition-all duration-300">
			{nf.format(asNum(data.nulos?.votos))}
		</div>
	</div>

	<div
		class="transform rounded-xl border-gray-200 bg-white p-2.5 shadow-sm
         transition duration-300 ease-out hover:scale-105 hover:shadow-md sm:p-3"
	>
		<div class="text-xs text-gray-900 duration-300">Habilitados</div>
		<div class="text-lg font-semibold text-gray-900 duration-300 sm:text-xl">
			{nf.format(asNum(data.habilitados))}
		</div>
	</div>
</div>
