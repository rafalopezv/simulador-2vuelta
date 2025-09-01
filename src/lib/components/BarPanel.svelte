<script>
	import {
		partidos,
		blanco,
		nulo,
		kpis,
		emitidos,
		destinoGlobal,
		recomputeAll,
		FINALISTA_A_ID,
		FINALISTA_B_ID
	} from '$lib/stores/nuevo';
	import PartyBar from './Partido.svelte';

	const nf = new Intl.NumberFormat('en-US');
	const labelW = '7rem';

	// datos reactivos
	$: partidosArr = Array.isArray($partidos) ? $partidos : [];
	$: blancoObj = $blanco ?? { votos: 0, pct: 0 };
	$: nuloObj = $nulo ?? { votos: 0, pct: 0 };

	// eje fijo: 0 .. 3.5M, ticks cada 500k
	const axisMax = 3500000;
	const step = 500000;
	$: ticks = Array.from({ length: Math.floor(axisMax / step) + 1 }, (_, i) => i * step);

	// — helpers —
	function transferToDestino(next, amount) {
		// amount > 0  => agregar a destino
		// amount < 0  => quitar del destino
		const dest = $destinoGlobal; // 'A' | 'B' | 'NULO'

		const apply = (id, delta) => {
			const j = next.findIndex((p) => p.id === id);
			if (j === -1) return;
			const cur = next[j].votos || 0;
			// no dejar en negativo
			next[j].votos = Math.max(0, cur + delta);
		};

		if (dest === 'A') {
			apply(FINALISTA_A_ID, amount);
		} else if (dest === 'B') {
			apply(FINALISTA_B_ID, amount);
		} else {
			// 'NULO' => repartir entre PDC y LIBRE
			apply(FINALISTA_A_ID, amount / 2);
			apply(FINALISTA_B_ID, amount / 2);
		}
	}

	// — handlers para partidos (NO nulo) —
	function onDragPartido(e) {
		const { name, votos: newV } = e.detail;

		partidos.update((arr) => {
			const next = arr.map((p) => ({ ...p }));
			const i = next.findIndex((p) => p.name === name);
			if (i === -1) return arr;

			const prevV = next[i].votos || 0;
			const delta = newV - prevV; // si es negativo, estamos quitando a ese partido

			if (delta === 0) return arr;

			// 1) actualiza el partido arrastrado
			next[i].votos = newV;

			// 2) mueve el delta al destino (pero SIN tocar válidos totales)
			//    - si delta < 0 ⇒ quitamos al partido ⇒ sumamos (+|delta|) al destino
			//    - si delta > 0 ⇒ estamos añadiendo al partido ⇒ restamos esa masa desde el destino
			transferToDestino(next, -delta);

			return next;
		});

		// Recalcular pcts/KPIs/termómetro en vivo
		recomputeAll();
	}

	function onChangePartido(e) {
		// por si acaso (normalmente ya estamos recalculando en onDragPartido)
		recomputeAll();
	}

	// — Nulo: sí cambia válidos —
	function onDragNulo(e) {
		const emi = $emitidos || 0;
		const bl = $blanco?.votos || 0;
		const nuBase = ($nulo?.baseVotos ?? $nulo?.votos) || 0;
		const minNulo = Math.round(emi * 0.035);

		const raw = e.detail.votos || 0;
		const v = Math.max(minNulo, Math.min(raw, nuBase));

		// 1) update nulo
		nulo.set({ ...$nulo, votos: v, pct: emi ? (100 * v) / emi : 0 });

		// 2) shortage para cuadrar identidad (válidos = emi - bl - nulo)
		const validTarget = Math.max(0, emi - bl - v);
		const currentSum = ($partidos || []).reduce((s, p) => s + (p.votos || 0), 0);
		const shortage = validTarget - currentSum;

		// 3) mover shortage al destino (A/B/mitad), finalistas pueden crecer
		partidos.update((arr) => {
			const next = arr.map((p) => ({ ...p }));
			transferToDestino(next, shortage);
			return next;
		});

		recomputeAll();
	}

	function onChangeNulo(e) {
		onDragNulo(e);
	}
</script>

<section class="w-full px-2 sm:px-4">
	<div class="rounded-xl border-gray-200 bg-white p-2.5 shadow-sm sm:p-3">
		<h3 class="mb-4 text-center text-base font-semibold text-gray-900 sm:text-lg">
			Resultados por partido (1ª vuelta)
		</h3>

		<div class="relative" style="--label-w: {labelW};">
			<!-- grid del eje detrás de las barras -->
			<div class="pointer-events-none absolute inset-0 z-0" style="left: calc({labelW} + 0.75rem);">
				<div class="relative h-full">
					{#each ticks as t}
						<div
							class="absolute top-0 bottom-0 border-l border-solid border-gray-200"
							style="left: {(t / axisMax) * 100}%;"
						></div>
					{/each}
				</div>
			</div>

			<!-- barras -->
			<div class="relative z-10 space-y-1.5 sm:space-y-2">
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
							class="absolute text-[10px] text-gray-500 tabular-nums sm:text-xs"
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
