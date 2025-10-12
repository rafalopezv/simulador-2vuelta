<script>
	import { kpis, pctA_valid, pctB_valid, partidos, FINALISTA_A_ID, FINALISTA_B_ID } from '$lib/stores/nuevo';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	const asNum = (x) => (Number.isFinite(+x) ? +x : 0);

	// Formateadores en-US (miles con coma, decimales con punto)
	const nf = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	});
	const nf1 = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	});

	const defaultKPIs = {
		validos: { votos: 0, pctEmit: 0 },
		emitidos: { votos: 0, pctHabilitados: 0 },
		nulos: { votos: 0, pctEmit: 0 },
		habilitados: 0
	};

	// Calculate disputable votes (gap between the two finalists)
	$: a = Math.max(0, Math.min(100, +$pctA_valid || 0));
	$: b = Math.max(0, Math.min(100, +$pctB_valid || 0));
	$: gapPct = Math.max(0, 100 - (a + b));

	$: votosA = $partidos?.find?.((p) => p.id === FINALISTA_A_ID)?.votos ?? 0;
	$: votosB = $partidos?.find?.((p) => p.id === FINALISTA_B_ID)?.votos ?? 0;
	$: validosTotal = data?.validos?.votos || 0;
	$: gapVotos = Math.max(0, validosTotal - votosA - votosB);

	// Tweened animations (smooth, predictable)
	const validosVotosTweened = tweened(0, {
		duration: 300,
		easing: cubicOut
	});
	const validosPctTweened = tweened(0, {
		duration: 300,
		easing: cubicOut
	});
	const emitidosVotosTweened = tweened(0, {
		duration: 300,
		easing: cubicOut
	});
	const emitidosPctTweened = tweened(0, {
		duration: 300,
		easing: cubicOut
	});
	const nulosVotosTweened = tweened(0, {
		duration: 300,
		easing: cubicOut
	});
	const nulosPctTweened = tweened(0, {
		duration: 300,
		easing: cubicOut
	});
	const habilitadosTweened = tweened(0, {
		duration: 300,
		easing: cubicOut
	});
	const gapPctTweened = tweened(0, {
		duration: 300,
		easing: cubicOut
	});
	const gapVotosTweened = tweened(0, {
		duration: 300,
		easing: cubicOut
	});

	$: data = $kpis ?? defaultKPIs;

	// Update tweened when data changes
	$: validosVotosTweened.set(asNum(data.validos?.votos));
	$: validosPctTweened.set(asNum(data.validos?.pctEmit));
	$: emitidosVotosTweened.set(asNum(data.emitidos?.votos));
	$: emitidosPctTweened.set(asNum(data.emitidos?.pctHabilitados));
	$: nulosVotosTweened.set(asNum(data.nulos?.votos));
	$: nulosPctTweened.set(asNum(data.nulos?.pctEmit));
	$: habilitadosTweened.set(asNum(data.habilitados));
	$: gapPctTweened.set(gapPct);
	$: gapVotosTweened.set(gapVotos);
</script>

<!-- grid contenedor -->
<div class="grid w-full grid-cols-2 gap-3 sm:gap-4">
	<!-- Válidos -->
	<div
		class="flex min-h-24 flex-col items-center justify-center rounded-xl bg-white p-3 text-center shadow-sm
             transition duration-300 ease-out hover:scale-105 hover:shadow-md"
	>
		<div class="text-[11px] font-medium text-gray-900 sm:text-xs">Votos válidos</div>
		<div class="text-lg font-semibold text-gray-800 tabular-nums sm:text-xl">
			{nf.format(Math.round($validosVotosTweened))}
		</div>
		<div class="text-[11px] text-gray-500 tabular-nums sm:text-xs">
			{nf1.format($validosPctTweened)}%
		</div>
	</div>

	<!-- Emitidos -->
	<div
		class="flex min-h-24 flex-col items-center justify-center rounded-xl bg-white p-3 text-center shadow-sm
             transition duration-300 ease-out hover:scale-105 hover:shadow-md"
	>
		<div class="text-[11px] font-medium text-gray-900 sm:text-xs">Votos emitidos</div>
		<div class="text-lg font-semibold text-gray-800 tabular-nums sm:text-xl">
			{nf.format(Math.round($emitidosVotosTweened))}
		</div>
		<div class="text-[11px] text-gray-500 tabular-nums sm:text-xs">
			{nf1.format($emitidosPctTweened)}%
		</div>
	</div>

	<!-- Nulos -->
	<div
		class="flex min-h-24 flex-col items-center justify-center rounded-xl bg-white p-3 text-center shadow-sm
             transition duration-300 ease-out hover:scale-105 hover:shadow-md"
	>
		<div class="text-[11px] font-medium text-gray-900 sm:text-xs">Votos nulos</div>
		<div class="text-lg font-semibold text-gray-800 tabular-nums sm:text-xl">
			{nf1.format($nulosPctTweened)}%
		</div>
		<div class="text-[11px] text-gray-500 tabular-nums sm:text-xs">
			{nf.format(Math.round($nulosVotosTweened))}
		</div>
	</div>

	<!-- Habilitados -->
	<div
		class="flex min-h-24 flex-col items-center justify-center rounded-xl bg-white p-3 text-center shadow-sm
             transition duration-300 ease-out hover:scale-105 hover:shadow-md"
	>
		<div class="text-[11px] font-medium text-gray-900 sm:text-xs">Habilitados</div>
		<div class="text-lg font-semibold text-gray-800 tabular-nums sm:text-xl">
			{nf.format(Math.round($habilitadosTweened))}
		</div>
	</div>
	<!-- Disputables % - destacado con fondo oscuro -->
	<div
		class="flex min-h-24 flex-col items-center justify-center rounded-xl bg-[#333333] p-3 text-center shadow-md
             transition duration-300 ease-out hover:scale-105 hover:shadow-lg"
	>
		<div class="text-[11px] font-medium text-gray-300 sm:text-xs">Votos disputables</div>
		<div class="text-lg font-semibold text-white tabular-nums sm:text-xl">
			{nf1.format($gapPctTweened)}%
		</div>
		<div class="text-[11px] text-gray-400 tabular-nums sm:text-xs">
			por asignar
		</div>
	</div>

	<!-- Disputables votos - destacado con fondo oscuro -->
	<div
		class="flex min-h-24 flex-col items-center justify-center rounded-xl bg-[#333333] p-3 text-center shadow-md
             transition duration-300 ease-out hover:scale-105 hover:shadow-lg"
	>
		<div class="text-[11px] font-medium text-gray-300 sm:text-xs">
			Votos sin asignar
		</div>
		<div class="text-lg font-semibold text-white tabular-nums sm:text-xl">
			{nf.format(Math.round($gapVotosTweened))}
		</div>
		<div class="text-[11px] text-gray-400 tabular-nums sm:text-xs">
			votos
		</div>
	</div>
</div>
