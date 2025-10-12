<script>
	import {
		redistribucionHistorica,
		partidos,
		nulo,
		FINALISTA_A_ID,
		FINALISTA_B_ID
	} from '$lib/stores/nuevo';
	import NumberFlow from '@number-flow/svelte';

	const finalistaAName = FINALISTA_A_ID;
	const finalistaBName = FINALISTA_B_ID;

	// ⚙️ lista de partidos + NULO
	$: allParties = [...$partidos.map((p) => p.id), 'NULO'];

	// 🧮 límite inferior y base ajustada del NULO
	const LIMITE_INFERIOR_NULO = 241515;
	$: baseNuloAjustada = Math.max(0, ($nulo?.baseVotos ?? 0) - LIMITE_INFERIOR_NULO);

	// 🎨 Colores de partidos (sincronizados con stores)
	const COLOR_MAP = {
		AP: '#80C7E7',
		LYP: '#555555',
		APB: '#9F7CCB',
		LIB: '#F28682',
		FP: '#B8E8F5',
		MAS: '#5371B8',
		UNI: '#F7D378',
		PDC: '#60B0AE',
		NULO: '#111827'
	};

	// 🏷️ Nombres de partidos (sincronizados con stores)
	const PARTY_NAME = {
		AP: 'AP',
		LYP: 'LYP ADN',
		APB: 'APB SÚMATE',
		LIB: 'LIBRE',
		FP: 'FP',
		MAS: 'MAS-IPSP',
		UNI: 'UNIDAD',
		PDC: 'PDC',
		NULO: 'Nulo'
	};

	// 🎬 Track which cells are updating
	let updatingCells = {}; // {partyId_finalista: timestamp}
	let previousValues = {}; // {partyId_finalista: value}

	// Helper para generar key única por celda
	const cellKey = (partyId, finalista) => `${partyId}_${finalista}`;

	// Reactividad: detectar cambios y marcar celdas como "updating"
	$: {
		allParties.forEach((id) => {
			const r = $redistribucionHistorica[id] || { a: 0, b: 0 };

			['a', 'b'].forEach((finalista) => {
				const key = cellKey(id, finalista);
				const currentValue = r[finalista];
				const prevValue = previousValues[key];

				if (prevValue !== undefined && prevValue !== currentValue) {
					// Valor cambió! Marcar como updating
					updatingCells[key] = Date.now();

					// Remover después de 300ms (mientras actualiza)
					setTimeout(() => {
						updatingCells = { ...updatingCells };
						delete updatingCells[key];
					}, 300);
				}

				previousValues[key] = currentValue;
			});
		});
	}

	// Helper para saber si una celda está actualizándose
	const isUpdating = (partyId, finalista) => {
		return !!updatingCells[cellKey(partyId, finalista)];
	};
</script>

<div class="rounded-xl bg-white p-3 shadow-sm">
	<h3 class="mb-1.5 text-center text-sm font-semibold text-gray-800">
		Transferencia de votos
	</h3>
	<div class="overflow-x-auto">
		<table class="min-w-full divide-y divide-gray-200 text-xs text-gray-700">
			<thead class="bg-gray-50">
				<tr>
					<th class="px-2 py-1 text-left font-semibold">Partido</th>
					<th class="px-2 py-1 text-center font-semibold">% → {finalistaAName}</th>
					<th class="px-2 py-1 text-center font-semibold">% → {finalistaBName}</th>
				</tr>
			</thead>

			<tbody class="divide-y divide-gray-100 bg-white">
				{#each allParties as id}
					{@const r = $redistribucionHistorica[id] || {
						base:
							id === 'NULO' ? baseNuloAjustada : $partidos.find((p) => p.id === id)?.baseVotos || 0,
						a: 0,
						b: 0
					}}

					<!-- Calcular porcentaje ajustado -->
					{@const pctA = r.base > 0 ? ((r.a / r.base) * 100) : 0}
					{@const pctB = r.base > 0 ? ((r.b / r.base) * 100) : 0}

					<!-- Color del partido que RECIBE (A=PDC, B=LIB) -->
					{@const colorA = COLOR_MAP.PDC}
					{@const colorB = COLOR_MAP.LIB}

					<tr>
						<td class="px-2 py-1 font-medium">{PARTY_NAME[id] || id}</td>

						<!-- Celda A (recibe PDC) con efectos -->
						<td
							class="cell px-2 py-1 text-center tabular-nums transition-all duration-300"
							class:updating={isUpdating(id, 'a')}
							class:has-value={pctA > 0}
							style="
								--receiver-color: {colorA};
								--receiver-color-20: {colorA}33;
								--receiver-color-15: {colorA}26;
							"
						>
							<NumberFlow value={pctA} format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }} />%
						</td>

						<!-- Celda B (recibe LIB) con efectos -->
						<td
							class="cell px-2 py-1 text-center tabular-nums transition-all duration-300"
							class:updating={isUpdating(id, 'b')}
							class:has-value={pctB > 0}
							style="
								--receiver-color: {colorB};
								--receiver-color-20: {colorB}33;
								--receiver-color-15: {colorB}26;
							"
						>
							<NumberFlow value={pctB} format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }} />%
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	/* Base cell styles */
	.cell {
		position: relative;
		border-radius: 4px;
		font-size: 0.875rem; /* text-sm default */
	}

	/* While updating: stronger background highlight (no border/ring) */
	.cell.updating {
		background-color: var(--receiver-color-20); /* 20% opacity - more noticeable */
	}

	/* When value > 0: semibold + noticeable background tint of RECEIVER party */
	.cell.has-value {
		font-weight: 600; /* semibold - matching KPI style */
		background-color: var(--receiver-color-15); /* 15% opacity - more visible */
	}

	/* If updating AND has value, prioritize updating background */
	.cell.updating.has-value {
		background-color: var(--receiver-color-20);
		font-weight: 600;
	}

	/* Smooth transitions */
	.cell {
		transition:
			background-color 300ms ease,
			font-weight 150ms ease;
	}
</style>
