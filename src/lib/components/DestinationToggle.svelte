<script>
	import { destinoGlobal } from '$lib/stores/nuevo';

	const opts = [
		{ key: 'A', label: 'PDC', color: '#4AA5A3' },
		{ key: 'B', label: 'LIBRE', color: '#F06B66' }
	];
</script>

<div class="mb-3 w-full text-center">
	<p class="text-sm font-medium text-gray-700 sm:text-base">Reasignar votos a:</p>
</div>

<div
	role="group"
	aria-label="Destino de reasignación"
	class="inline-flex w-full justify-center rounded-lg bg-gray-100 p-1"
>
	{#each opts as o}
		<button
			type="button"
			on:click={() => ($destinoGlobal = o.key)}
			aria-pressed={$destinoGlobal === o.key}
			class="flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold transition-[background-color,color,box-shadow,transform]
                   duration-200 ease-out select-none
                   hover:scale-[1.01] focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-gray-400 active:scale-[0.99]"
			style={$destinoGlobal === o.key
				? `background:${o.color}; color:#fff; box-shadow:0 1px 0 rgba(0,0,0,.06);`
				: `background:#e5e7eb; color:#374151;`}
			on:keydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					$destinoGlobal = o.key;
				}
			}}
		>
			{o.label}
		</button>
	{/each}
</div>
