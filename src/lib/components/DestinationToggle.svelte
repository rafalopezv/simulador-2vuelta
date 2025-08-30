<script>
	import { destinoGlobal } from '$lib/stores/sim';
	const opts = [
		{ key: 'A', label: 'PDC' },
		{ key: 'B', label: 'LIBRE' },
		{ key: 'NULO', label: 'Nulo' }
	];
</script>

<div class="w-full">
	<p class="text-11 mb-2 pb-2 font-semibold text-gray-900">
		Define hacia dónde se moverán los votos al arrastrar una barra.
	</p>
	<div class="grid grid-cols-3 gap-2 pb-2">
		{#each opts as o}
			<button
				on:click={() => ($destinoGlobal = o.key)}
				class="rounded-lg px-2.5 py-2 text-sm font-medium shadow-sm transition
                 {$destinoGlobal === o.key
					? 'bg-gray-900 text-white'
					: 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
			>
				{o.label}
			</button>
		{/each}
	</div>
</div>
