<script>
	import {
		partidos,
		blanco,
		nulo,
		kpis,
		emitidos,
		rebalanceToDestino,
		recomputeAll,
		destinoGlobal,
		FINALISTA_A_ID,
		FINALISTA_B_ID
	} from '$lib/stores/sim';
	import PartyBar from './Partido.svelte';

	const nf = new Intl.NumberFormat('es-BO');
	const labelW = '7rem';

	// datos reactivos
	$: partidosArr = Array.isArray($partidos) ? $partidos : [];
	$: blancoObj = $blanco ?? { votos: 0, pct: 0 };
	$: nuloObj = $nulo ?? { votos: 0, pct: 0 };

	// eje fijo: 0 .. 3.5M, ticks cada 500k
	const axisMax = 3500000;
	const step = 500000;
	$: ticks = Array.from({ length: Math.floor(axisMax / step) + 1 }, (_, i) => i * step);

	// — handlers —
	function onDragPartido(e) {
		const { name, votos } = e.detail;
		partidos.update((arr) => arr.map((p) => (p.name === name ? { ...p, votos } : p)));
		recomputeAll(); // 🔴 recalcula KPIs/termómetro en vivo
	}
	function onChangePartido(e) {
		const { name, votos } = e.detail;
		partidos.update((arr) => arr.map((p) => (p.name === name ? { ...p, votos } : p)));
		recomputeAll(); // por si acaso, confirma al soltar
	}

	function onDragNulo(e) {
		const emi = $emitidos || 0;
		const bl = $blanco?.votos || 0;
		const nuBase = ($nulo?.baseVotos ?? $nulo?.votos) || 0;
		const minNulo = Math.round(emi * 0.035);

		const raw = e.detail.votos || 0;
		const v = Math.max(minNulo, Math.min(raw, nuBase));

		// 1) Update nulo store synchronously
		nulo.set({ ...$nulo, votos: v, pct: emi ? (100 * v) / emi : 0 });

		// 2) Compute shortage
		const validTarget = Math.max(0, emi - bl - v);
		const currentSum = ($partidos || []).reduce((s, p) => s + (p.votos || 0), 0);
		const shortage = validTarget - currentSum;

		// 3) Update target party based on destinoGlobal
		const dest = $destinoGlobal; // 'A' | 'B' | 'NULO'
		const targetId = dest === 'A' ? FINALISTA_A_ID : dest === 'B' ? FINALISTA_B_ID : null;

		partidos.update((arr) => {
			const safeValid = validTarget || 1; // Avoid division by zero
			return arr.map((p) => {
				if (targetId && p.id === targetId) {
					const max = Number.POSITIVE_INFINITY; // Finalists can exceed baseline
					const min = 0;
					const newVotos = Math.max(min, Math.min((p.votos || 0) + shortage, max));
					return { ...p, votos: newVotos, pct: (100 * newVotos) / safeValid };
				} else if (dest === 'NULO' && (p.id === FINALISTA_A_ID || p.id === FINALISTA_B_ID)) {
					const halfShortage = shortage / 2;
					const max = Number.POSITIVE_INFINITY;
					const min = 0;
					const newVotos = Math.max(min, Math.min((p.votos || 0) + halfShortage, max));
					return { ...p, votos: newVotos, pct: (100 * newVotos) / safeValid };
				}
				return p; // Keep pct unchanged for non-target parties during drag
			});
		});
	}

	function onChangeNulo(e) {
		onDragNulo(e); // Apply same logic
		recomputeAll(); // Recalculate percentages and KPIs on drag end
	}
</script>

<!-- Same markup as before -->
<section class="w-full px-2 sm:px-4">
	<div class="rounded-xl border-gray-200 bg-white p-2.5 shadow-sm sm:p-3">
		<h3 class="mb-4 text-center text-base font-semibold text-gray-900 sm:text-lg">
			Resultados por partido (1ª vuelta)
		</h3>

		<div class="relative" style="--label-w: {labelW};">
			<!-- grid del eje -->
			<div
				class="pointer-events-none absolute inset-0 z-0"
				style="left: calc({labelW} + 0.75rem); "
			>
				<div class="relative h-full">
					{#each ticks as t}
						<div
							class="absolute top-0 bottom-0 border-l border-solid border-gray-200"
							style="left: {(t / axisMax) * 100}%; z-index: 5;"
						></div>
					{/each}
				</div>
			</div>

			<!-- barras -->
			<div class="space-y-1.5 sm:space-y-2">
				{#each partidosArr as p, i}
					<PartyBar
						name={p.name}
						color={p.color}
						votos={p.votos}
						pct={p.pct}
						{axisMax}
						on:update={onDragPartido}
						on:commit={onChangePartido}
						draggable={true}
						staggerIndex={i}
						staggerStep={40}
						baseVotos={p.baseVotos}
						allowAboveBaseline={p.id === 'PDC' || p.id === 'LIB'}
						minVotos={0}
						maxVotos={p.id === 'PDC' || p.id === 'LIB' ? axisMax : (p.baseVotos ?? p.votos)}
					/>
				{/each}

				<div class="border-t border-dashed border-gray-200 pt-2">
					<!-- Nulo: min 3.5% emitidos, no pasar baseline -->
					<PartyBar
						name="Nulo (editable)"
						color="#111827"
						votos={nuloObj.votos}
						pct={nuloObj.pct}
						{axisMax}
						baseVotos={nuloObj.baseVotos ?? nuloObj.votos}
						minVotos={Math.round(($emitidos || 0) * 0.035)}
						maxVotos={nuloObj.baseVotos ?? nuloObj.votos}
						allowAboveBaseline={false}
						draggable={true}
						staggerIndex={partidosArr.length}
						staggerStep={40}
						on:update={onDragNulo}
						on:commit={onChangeNulo}
					/>
					<PartyBar
						name="Blanco (fijo)"
						color="#CBD5E1"
						votos={blancoObj.votos}
						pct={blancoObj.pct}
						{axisMax}
						baseVotos={blancoObj.votos}
						draggable={false}
					/>
				</div>
			</div>

			<!-- etiquetas -->
			<div class="mt-3 grid" style="grid-template-columns: {labelW} 1fr;">
				<div></div>
				<div class="relative h-4" style="margin-left: 0.75rem;">
					{#each ticks as t, i}
						<span
							class="absolute font-mono text-[10px] text-gray-500 tabular-nums sm:text-xs"
							style="
                left: {(t / axisMax) * 100}%;
                --pad: 4px;
                transform: {i === ticks.length - 1
								? 'translateX(calc(-100% - var(--pad)))'
								: 'translateX(var(--pad))'};
                text-align: {i === ticks.length - 1 ? 'right' : 'left'};
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
