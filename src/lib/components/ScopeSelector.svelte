<script>
	import {
		ambito,
		nodoSeleccionado,
		nodosExterior,
		nodosNacional,
		capitales
	} from '$lib/stores/sim';

	const ambitos = [
		{ key: 'MUNDIAL', label: 'Mundial' },
		{ key: 'EXTERIOR', label: 'Exterior' },
		{ key: 'NACIONAL', label: 'Nacional' },
		{ key: 'CAPITALES', label: 'C. Capitales' }
	];

	const labelDropdown = (a) =>
		a === 'EXTERIOR'
			? 'País'
			: a === 'NACIONAL'
				? 'Departamento'
				: a === 'CAPITALES'
					? 'Ciudad capital'
					: 'Nodo';

	const cityOption = (c) => `${c.ciudad} (${c.dpto})`;

	function setAmbito(a) {
		$ambito = a;
		$nodoSeleccionado = 'Total';
	}
	const isMundial = () => $ambito === 'MUNDIAL';
</script>

<div class="space-y-3">
	<p class="text-11 mb-2 pb-2 font-semibold text-gray-900">
		Define qué lugar de la votaicón quieres ajustar
	</p>
	<!-- Ámbitos 2x2 -->
	<div class="grid grid-cols-2 gap-2 pb-2">
		{#each ambitos as a}
			<button
				on:click={() => setAmbito(a.key)}
				class="rounded-lg px-3 py-2 text-sm font-medium transition
                 {$ambito === a.key
					? 'bg-gray-900 text-white'
					: 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
			>
				{a.label}
			</button>
		{/each}
	</div>

	<!-- Dropdown dependiente -->
	<div class="flex items-center gap-2 pb-2">
		<span class="text-xs text-gray-600">{labelDropdown($ambito)}:</span>
		<div class="relative">
			<select
				bind:value={$nodoSeleccionado}
				class="w-48 appearance-none rounded-lg border border-gray-300 bg-white px-2
                 py-1.5 pr-6 text-sm shadow-sm focus:ring-2 focus:ring-gray-900 focus:outline-none disabled:cursor-not-allowed
                 disabled:opacity-50 sm:w-56"
				disabled={isMundial()}
			>
				<option value="Total">Total</option>

				{#if $ambito === 'EXTERIOR'}
					{#each nodosExterior as n}<option value={n}>{n}</option>{/each}
				{:else if $ambito === 'NACIONAL'}
					{#each nodosNacional as n}<option value={n}>{n}</option>{/each}
				{:else if $ambito === 'CAPITALES'}
					{#each capitales as c}
						<option value={cityOption(c)}>{cityOption(c)}</option>
					{/each}
				{/if}
			</select>
			<div class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">
				▾
			</div>
		</div>
	</div>
</div>
