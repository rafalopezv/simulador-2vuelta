<script>
	import { Settings } from 'lucide-svelte';

	import ScopeSelector from '$lib/components/ScopeSelector.svelte';
	import DestinationToggle from '$lib/components/DestinationToggle.svelte';
	import KPI from '$lib/components/KPI.svelte';
	import Reset from '$lib/components/Reset.svelte';
	import EstadoReparto from '$lib/components/EstadoReparto.svelte';

	let advancedOpen = false;
</script>

<div class="space-y-5">
	<!-- <Reset /> -->

	<!-- <div class="rounded-2xl bg-white p-3 ring-1 ring-gray-200 sm:p-4">
		<DestinationToggle />
	</div> -->

	<!-- Ajuste avanzado (muestra/oculta el ScopeSelector) -->
	<!-- <div class="cursor-pointer rounded-2xl bg-white p-3 ring-1 ring-gray-200 sm:p-4">
		<button
			type="button"
			on:click={() => (advancedOpen = !advancedOpen)}
			class="inline-flex w-full items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-xs
			   font-medium text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-100 focus:outline-none
			   focus-visible:ring-2 focus-visible:ring-gray-400"
			aria-expanded={advancedOpen}
			aria-controls="advanced-scope"
		>
			<span class="inline-flex items-center gap-2">
				<Settings class="h-4 w-4  opacity-80" />
				Ajuste avanzado
			</span>
			<span class="text-gray-500">{advancedOpen ? '–' : '+'}</span>
		</button>

		{#if advancedOpen}
			<div id="advanced-scope" class="mt-3">
				<ScopeSelector />
			</div>
		{/if}
	</div> -->

	<!-- Destino: siempre visible -->

	<!-- KPI: siempre visible -->

	<KPI />
	<EstadoReparto />
</div>
