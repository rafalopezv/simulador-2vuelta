<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { spring } from 'svelte/motion';
	import { Info, RotateCcw } from 'lucide-svelte';
	import ResetButton from '$lib/components/Reset.svelte';
	import Help from '$lib/components/Help.svelte';
	import DragDemo from '$lib/components/DragDemo.svelte';
	import { resetAllStores } from '$lib/stores/nuevo';

	export let onOpenHelp = () => {}; // Prop for opening help drawer

	const infoScale = spring(1, {
		stiffness: 0.2,
		damping: 0.4
	});

	const resetScale = spring(1, {
		stiffness: 0.2,
		damping: 0.4
	});

	let infoBtnRef;

	function handleReset() {
		resetAllStores();
	}

	import {
		partidos,
		blanco,
		nulo,
		kpis,
		emitidos,
		destinoGlobal,
		recomputeAll,
		FINALISTA_A_ID,
		FINALISTA_B_ID,
		setNuloVotos,
		redistribucionHistorica,
		registrarRedistribucion
	} from '$lib/stores/nuevo';
	import PartyBar from './Partido.svelte';
	import { formatAxis } from '$lib/stores/axis.js';

	const LIMITE_INFERIOR_NULO = 241515;

	const nf = new Intl.NumberFormat('en-US');
	const labelW = '5rem'; // Reduced from 7rem for mobile space saving

	// datos reactivos
	$: partidosArr = Array.isArray($partidos) ? $partidos : [];
	$: blancoObj = $blanco ?? { votos: 0, pct: 0 };
	$: nuloObj = $nulo ?? { votos: 0, pct: 0 };

	$: histNulo = $redistribucionHistorica?.NULO || { a: 0, b: 0, base: $nulo?.baseVotos ?? 0 };
	$: totalAsignadoNulo = Math.min((histNulo.a ?? 0) + (histNulo.b ?? 0), histNulo.base ?? 0);
	$: nuloMin = LIMITE_INFERIOR_NULO + totalAsignadoNulo;

	// Dynamic maximum based on current destination and what can be recovered
	$: nuloMax = (() => {
		const nuBase = ($nulo?.baseVotos ?? $nulo?.votos) || 0;
		const currentNulo = $nulo?.votos || 0;
		const currentDest = $destinoGlobal;

		let maxRecoverableVotes = 0;
		if (currentDest === 'A') {
			maxRecoverableVotes = histNulo.a;
		} else if (currentDest === 'B') {
			maxRecoverableVotes = histNulo.b;
		} else {
			// 'NULO' - split recovery
			maxRecoverableVotes = Math.min(histNulo.a, histNulo.b) * 2;
		}

		return Math.min(currentNulo + maxRecoverableVotes, nuBase);
	})();

	// Dynamic max for each party based on what can be recovered from current destination
	$: partidosWithDynamicMax = partidosArr.map((p) => {
		const histParty = $redistribucionHistorica?.[p.id] || { a: 0, b: 0, base: p.baseVotos || 0 };
		const currentDest = $destinoGlobal;
		const currentVotes = p.votos || 0;
		const baseVotes = p.baseVotos || currentVotes;

		let maxRecoverableVotes = 0;
		if (currentDest === 'A') {
			maxRecoverableVotes = histParty.a;
		} else if (currentDest === 'B') {
			maxRecoverableVotes = histParty.b;
		} else {
			// 'NULO' - split recovery
			maxRecoverableVotes = Math.min(histParty.a, histParty.b) * 2;
		}

		// For special parties (PDC, LIB), allow above baseline
		const dynamicMax =
			p.id === 'PDC' || p.id === 'LIB'
				? axisMax
				: Math.min(currentVotes + maxRecoverableVotes, baseVotes);

		return {
			...p,
			dynamicMax
		};
	});

	// Dynamic axis with smooth animation (like bar chart race)
	const BASE_AXIS_MAX = 2500000;
	const STEP = 500000;
	const GROWTH_THRESHOLD = 0.85; // When bar reaches 85% of axis, start growing

	// Tweened axis for smooth scaling
	const axisMaxTweened = tweened(BASE_AXIS_MAX, {
		duration: 600,
		easing: cubicOut
	});

	// Calculate dynamic axis based on max party value
	$: {
		const maxVotos = Math.max(...partidosArr.map((p) => p.votos || 0));
		const currentAxisMax = $axisMaxTweened;

		// If any bar exceeds threshold, grow the axis
		if (maxVotos > currentAxisMax * GROWTH_THRESHOLD) {
			// Round up to next step interval
			const newMax = Math.ceil(maxVotos / STEP) * STEP + STEP;
			axisMaxTweened.set(Math.max(newMax, BASE_AXIS_MAX));
		}
		// Shrink back if possible (but not below base)
		else if (maxVotos < currentAxisMax * 0.7 && currentAxisMax > BASE_AXIS_MAX) {
			const newMax = Math.ceil(maxVotos / STEP) * STEP + STEP;
			axisMaxTweened.set(Math.max(newMax, BASE_AXIS_MAX));
		}
	}

	$: axisMax = $axisMaxTweened;
	$: ticks = Array.from({ length: Math.floor(axisMax / STEP) + 1 }, (_, i) => i * STEP);

	// — helpers —
	function transferToDestino(next, amount) {
		const dest = $destinoGlobal; // 'A' | 'B' | 'NULO'
		const apply = (id, delta) => {
			const j = next.findIndex((p) => p.id === id);
			if (j === -1) return;
			const cur = next[j].votos || 0;
			next[j].votos = Math.max(0, cur + delta);
		};
		if (dest === 'A') {
			apply(FINALISTA_A_ID, amount);
		} else if (dest === 'B') {
			apply(FINALISTA_B_ID, amount);
		} else {
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

			const party = arr[i];
			const partyId = party.id;
			const prevV = next[i].votos || 0;
			const baseV = party.baseVotos || prevV;
			const delta = newV - prevV; // positive = recovering (drag right), negative = assigning (drag left)

			if (delta === 0) return arr;

			let finalVotos = newV;

			// If recovering (dragging right)
			if (delta > 0) {
				const histParty = $redistribucionHistorica?.[partyId] || { a: 0, b: 0, base: baseV };
				const currentDest = $destinoGlobal;

				let maxRecovery = 0;

				// Calculate maximum recoverable votes based on currently selected destination
				if (currentDest === 'A') {
					maxRecovery = histParty.a; // Can only recover what A has
				} else if (currentDest === 'B') {
					maxRecovery = histParty.b; // Can only recover what B has
				} else {
					// 'NULO' - split recovery, both must have votes
					maxRecovery = Math.min(histParty.a, histParty.b) * 2;
				}

				// Constrain recovery to available votes from selected finalist
				const allowedDelta = Math.min(delta, maxRecovery);
				finalVotos = prevV + allowedDelta;
			} else {
				// Assigning votes (dragging left)
				// For PDC/LIB finalists: allow reduction down to baseVotos (they can transfer to each other)
				// For other parties: constrain to baseVotos
				if (partyId === 'PDC' || partyId === 'LIB') {
					finalVotos = Math.max(0, newV);
				} else {
					finalVotos = Math.max(0, Math.min(newV, baseV));
				}
			}

			const actualDelta = finalVotos - prevV;

			// Register redistribution if votes changed
			if (actualDelta !== 0) {
				registrarRedistribucion(partyId, baseV, actualDelta);
			}

			next[i].votos = finalVotos;
			transferToDestino(next, -actualDelta);
			return next;
		});
		recomputeAll();
	}

	function onChangePartido() {
		recomputeAll();
	}

	// — Nulo: sí cambia válidos —
	function onDragNulo(e) {
		const emi = $emitidos || 0;
		const bl = $blanco?.votos || 0;
		const nuBase = ($nulo?.baseVotos ?? $nulo?.votos) || 0;

		// Get current redistribution state
		const histNulo = $redistribucionHistorica?.NULO || { a: 0, b: 0, base: nuBase };
		const currentDest = $destinoGlobal;

		const raw = e.detail.votos || 0;
		const currentNulo = $nulo?.votos || 0;
		const delta = raw - currentNulo; // positive = recovering (drag right), negative = assigning (drag left)

		let finalVotos = raw;

		// If recovering (dragging right)
		if (delta > 0) {
			let maxRecovery = 0;

			// Calculate maximum recoverable votes based on currently selected destination
			if (currentDest === 'A') {
				maxRecovery = histNulo.a; // Can only recover what A has
			} else if (currentDest === 'B') {
				maxRecovery = histNulo.b; // Can only recover what B has
			} else {
				// 'NULO' - split recovery, both must have votes
				maxRecovery = Math.min(histNulo.a, histNulo.b) * 2;
			}

			// Constrain recovery to available votes from selected finalist
			const allowedDelta = Math.min(delta, maxRecovery);
			finalVotos = currentNulo + allowedDelta;
		} else {
			// Assigning votes (dragging left) - constrain to minimum
			const minNulo = LIMITE_INFERIOR_NULO;
			finalVotos = Math.max(minNulo, Math.min(raw, nuBase));
		}

		// Apply the final vote count
		setNuloVotos(finalVotos);

		// Update valid target and redistribute
		const validTarget = Math.max(0, emi - bl - finalVotos);
		const currentSum = ($partidos || []).reduce((s, p) => s + (p.votos || 0), 0);
		const shortage = validTarget - currentSum;

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

	// Demo animation state
	let isDemoPlaying = false;
	let demoPhase = 0; // 0: idle, 1: dragging left, 2: pausing, 3: dragging back

	function playDemo() {
		if (isDemoPlaying) return;
		isDemoPlaying = true;
		demoPhase = 1;

		// Find UNIDAD party
		const unidadParty = partidosArr.find((p) => p.id === 'UNI');
		if (!unidadParty) {
			isDemoPlaying = false;
			return;
		}

		const originalVotes = unidadParty.votos;
		const baseVotes = unidadParty.baseVotos || originalVotes;
		const demoAmount = 300000; // Transfer amount for demo

		// Phase 1: Drag left (transfer to LIBRE)
		setTimeout(() => {
			const newVotes = Math.max(0, originalVotes - demoAmount);
			const actualDelta = originalVotes - newVotes;

			partidos.update((arr) => {
				const next = arr.map((p) => ({ ...p }));
				const unidadIdx = next.findIndex((p) => p.id === 'UNI');
				if (unidadIdx !== -1) {
					next[unidadIdx].votos = newVotes;

					// Register redistribution properly
					registrarRedistribucion('UNI', baseVotes, -actualDelta);

					// Transfer to LIBRE (destination B)
					const idxB = next.findIndex((p) => p.id === 'LIB');
					if (idxB !== -1) {
						next[idxB].votos += actualDelta;
					}
				}
				return next;
			});
			recomputeAll();
			demoPhase = 2;
		}, 1000);

		// Phase 2: Pause
		setTimeout(() => {
			demoPhase = 3;
		}, 4000);

		// Phase 3: Drag back (restore)
		setTimeout(() => {
			const newVotes = originalVotes;
			const currentVotes = partidosArr.find((p) => p.id === 'UNI')?.votos || 0;
			const actualDelta = newVotes - currentVotes;

			partidos.update((arr) => {
				const next = arr.map((p) => ({ ...p }));
				const unidadIdx = next.findIndex((p) => p.id === 'UNI');
				if (unidadIdx !== -1) {
					next[unidadIdx].votos = originalVotes;

					// Register redistribution properly (recovering votes)
					registrarRedistribucion('UNI', baseVotes, actualDelta);

					// Remove from LIBRE
					const idxB = next.findIndex((p) => p.id === 'LIB');
					if (idxB !== -1) {
						next[idxB].votos -= actualDelta;
					}
				}
				return next;
			});
			recomputeAll();
		}, 5000);

		// Phase 4: Complete
		setTimeout(() => {
			isDemoPlaying = false;
			demoPhase = 0;
		}, 8000);
	}
</script>

<section class="w-full">
	<div
		class="relative min-h-[560px] rounded-xl border-gray-200 bg-white p-2 shadow-sm sm:p-3 md:min-h-[640px]"
	>
		<!-- Desktop buttons in top-right corner -->
		<div class="absolute top-2 right-2 z-20 hidden items-center gap-2 sm:flex">
			<Help inline={true} />
			<ResetButton />
			<DragDemo on:play={playDemo} />
		</div>

		<!-- Title with flanking icons (mobile only) -->
		<div class="mb-4 space-y-1">
			<div class="flex items-center justify-between gap-2 sm:hidden">
				<!-- Left: Help icon -->
				<button
					on:mousedown={() => infoScale.set(0.85)}
					on:mouseup={() => infoScale.set(1)}
					on:mouseleave={() => infoScale.set(1)}
					on:click={onOpenHelp}
					class="flex h-8 w-8 items-center justify-center transition"
					style="transform: scale({$infoScale});"
					aria-label="Ayuda"
				>
					<Info class="h-5 w-5 text-gray-700" />
				</button>

				<!-- Center: Title -->
				<h3 class="flex-1 text-center text-base font-semibold text-gray-800">
					Resultados 1ª vuelta
				</h3>

				<!-- Right: Reset icon (no box) -->
				<button
					on:mousedown={() => resetScale.set(0.85)}
					on:mouseup={() => resetScale.set(1)}
					on:mouseleave={() => resetScale.set(1)}
					on:click={handleReset}
					class="flex h-8 w-8 items-center justify-center transition"
					style="transform: scale({$resetScale});"
					aria-label="Resetear"
				>
					<RotateCcw class="h-5 w-5 text-gray-700" />
				</button>
			</div>

			<!-- Desktop title (centered) -->
			<h3 class="hidden text-base font-semibold text-gray-800 sm:block sm:text-center sm:text-lg">
				Resultados 1ª vuelta
			</h3>
			<!-- Desktop instruction -->
			<p class="hidden items-center justify-center gap-1.5 text-xs text-gray-500 lg:flex">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-gray-400"
				>
					<path d="M18 15l-6-6-6 6" />
				</svg>
				Arrastra las barras para transferir votos
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-gray-400"
				>
					<path d="M6 9l6 6 6-6" />
				</svg>
			</p>
			<!-- Mobile instruction -->
			<p class="flex items-center justify-center gap-1.5 text-xs text-gray-500 lg:hidden">
				Usa los controles abajo para transferir votos
			</p>
		</div>

		<div class="relative" style="--label-w: {labelW};">
			<!-- grid del eje detrás de las barras -->
			<div class="pointer-events-none absolute inset-0 z-0" style="left: calc({labelW} + 0.25rem);">
				<div class="relative h-full">
					{#each ticks as t}
						<div
							class="absolute top-0 bottom-0 border-l border-solid border-gray-200"
							style="left: {(t / axisMax) * 100}%;"
						></div>
					{/each}
				</div>
			</div>

			<!-- Demo cursor overlay -->
			{#if isDemoPlaying}
				<div class="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
					<div
						class="rounded-lg bg-gray-900/80 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm"
					>
						{#if demoPhase === 1}
							Arrastrando...
						{:else if demoPhase === 2}
							Viste cómo funciona?
						{:else if demoPhase === 3}
							Restaurando...
						{/if}
					</div>
				</div>
			{/if}

			<!-- barras -->
			<div class="relative z-10 space-y-1.5 sm:space-y-2.5">
				{#each partidosWithDynamicMax as p, i}
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
						maxVotos={p.dynamicMax}
					/>
				{/each}

				<div class="border-t border-dashed border-gray-200 pt-2">
					<PartyBar
						name="Nulo"
						color="#111827"
						votos={nuloObj.votos}
						pct={nuloObj.pct}
						{axisMax}
						baseVotos={nuloObj.baseVotos ?? nuloObj.votos}
						minVotos={LIMITE_INFERIOR_NULO}
						maxVotos={nuloMax}
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
				<div class="relative h-5" style="margin-left: 0.25rem;">
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
							{formatAxis(t)}
						</span>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
