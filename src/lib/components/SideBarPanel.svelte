<script>
	import ScopeSelector from '$lib/components/ScopeSelector.svelte';
	import DestinationToggle from '$lib/components/DestinationToggle.svelte';
	import KPI from '$lib/components/KPI.svelte';
</script>

<div class="space-y-5">
	<div class="rounded-2xl bg-white p-3 ring-1 ring-gray-200 sm:p-4">
		<ScopeSelector />
	</div>

	<div class="rounded-2xl bg-white p-3 ring-1 ring-gray-200 sm:p-4">
		<DestinationToggle />
	</div>

	<KPI />
</div>
