<script>
	import MinimalSelect from '$lib/components/MinimalSelect.svelte';
	import {
		ambito, // store
		nodoSeleccionado,
		nodosExterior,
		nodosNacional,
		capitales
	} from '$lib/stores/sim';

	const opciones = [
		{ label: 'Mundial', value: 'MUNDIAL' },
		{ label: 'Exterior', value: 'EXTERIOR' },
		{ label: 'Nacional', value: 'NACIONAL' },
		{ label: 'C. Capitales', value: 'CAPITALES' }
	];

	function onChange(e) {
		// actualiza el store
		$ambito = e.detail.value;
		$nodoSeleccionado = 'Total';
	}

	const labelDropdown = (a) =>
		a === 'EXTERIOR'
			? 'País'
			: a === 'NACIONAL'
				? 'Departamento'
				: a === 'CAPITALES'
					? 'Ciudad capital'
					: 'Nodo';

	const cityOption = (c) => ({
		value: `${c.ciudad} (${c.dpto})`,
		label: `${c.ciudad} (${c.dpto})`
	});

	$: itemsNodos =
		$ambito === 'EXTERIOR'
			? [{ value: 'Total', label: 'Total' }, ...nodosExterior.map((n) => ({ value: n, label: n }))]
			: $ambito === 'NACIONAL'
				? [
						{ value: 'Total', label: 'Total' },
						...nodosNacional.map((n) => ({ value: n, label: n }))
					]
				: $ambito === 'CAPITALES'
					? [{ value: 'Total', label: 'Total' }, ...capitales.map(cityOption)]
					: [{ value: 'Total', label: 'Total' }];

	function setAmbito(val) {
		$ambito = val;
		$nodoSeleccionado = 'Total';
	}
</script>

<!-- Etiqueta -->
<div class="mb-3 w-full text-center">
	<p class="text-sm font-medium text-gray-700 sm:text-base">Reasignar votos desde:</p>
</div>

<div class="space-y-2">
	<!-- Ámbito -->
	<div>
		<label class="mb-1 block text-[11px] text-gray-600 sm:text-xs">Ámbito</label>

		<!-- Desktop: custom -->
		<div class="hidden sm:block">
			<MinimalSelect
				items={opciones}
				bind:selected={$ambito}
				placeholder="Seleccionar ámbito"
				on:change={onChange}
			/>
		</div>

		<!-- Mobile: nativo -->
		<div class="relative sm:hidden">
			<select
				bind:value={$ambito}
				on:change={(e) => setAmbito(e.target.value)}
				class="w-full appearance-none rounded-lg bg-gray-100 px-3 py-2 pr-8 text-xs
                 text-gray-900 transition hover:bg-gray-200 focus:ring-2 focus:ring-gray-900 focus:outline-none"
			>
				{#each opciones as a}<option value={a.value}>{a.label}</option>{/each}
			</select>
			<span class="pointer-events-none absolute right-2 bottom-2 text-gray-500">▾</span>
		</div>
	</div>

	<!-- Nodo -->
	<div>
		<label class="mb-1 block text-[11px] text-gray-600 sm:text-xs">{labelDropdown($ambito)}</label>

		<!-- Desktop: custom -->
		<div class="hidden sm:block">
			<MinimalSelect
				items={itemsNodos}
				bind:selected={$nodoSeleccionado}
				placeholder="Selecciona nodo"
				disabled={$ambito === 'MUNDIAL'}
			/>
		</div>

		<!-- Mobile: nativo -->
		<div class="relative sm:hidden">
			<select
				bind:value={$nodoSeleccionado}
				disabled={$ambito === 'MUNDIAL'}
				class="w-full appearance-none rounded-lg bg-gray-100 px-3 py-2 pr-8 text-xs
                 text-gray-900 transition hover:bg-gray-200 focus:ring-2 focus:ring-gray-900 focus:outline-none
                 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{#each itemsNodos as it}<option value={it.value}>{it.label}</option>{/each}
			</select>
			<span class="pointer-events-none absolute right-2 bottom-2 text-gray-500">▾</span>
		</div>
	</div>
</div>
