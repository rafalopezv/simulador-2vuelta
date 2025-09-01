<script>
	import { destinoGlobal } from '$lib/stores/nuevo';
	const opts = [
		{ key: 'A', label: 'PDC' },
		{ key: 'B', label: 'LIBRE' }
	];
</script>

<div class="mb-3 w-full text-center">
	<p class="text-sm font-medium text-gray-700 sm:text-base">Reasignar votos a:</p>
</div>

<div class="inline-flex w-full justify-center rounded-lg bg-gray-100 p-1">
	{#each opts as o}
		<button
			on:click={() => ($destinoGlobal = o.key)}
			class="flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm
               font-medium transition-[background-color,color,box-shadow,transform,border]
               duration-250 ease-out select-none
               hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300
               focus-visible:ring-offset-1 active:scale-[0.99]
               {$destinoGlobal === o.key
				? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-300'
				: 'text-gray-600 hover:text-gray-900'}"
			aria-pressed={$destinoGlobal === o.key}
		>
			{o.label}
		</button>
	{/each}
</div>
