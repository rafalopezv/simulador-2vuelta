<script>
	import { RotateCcw } from 'lucide-svelte';
	import { resetAllStores } from '$lib/stores/nuevo';
	import { spring } from 'svelte/motion';

	const scale = spring(1, {
		stiffness: 0.2,
		damping: 0.4
	});

	let btnRef;

	function resetAll() {
		resetAllStores();
		// quitar foco después de click para esconder tooltip
		setTimeout(() => btnRef?.blur(), 150);
	}
</script>

<div class="group relative inline-block">
	<button
		bind:this={btnRef}
		on:mousedown={() => scale.set(0.85)}
		on:mouseup={() => scale.set(1)}
		on:mouseleave={() => scale.set(1)}
		on:click={resetAll}
		class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200
		       bg-white shadow-sm transition hover:bg-gray-50 focus:outline-none"
		style="transform: scale({$scale});"
		aria-label="Resetear"
	>
		<RotateCcw class="h-5 w-5 text-gray-700" />
	</button>

	<!-- Tooltip -->
	<div
		class="absolute -top-10 left-1/2 -translate-x-1/2 rounded-md bg-gray-900
		       px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0
		       shadow-md transition group-focus-within:opacity-100 group-hover:opacity-100"
	>
		Resetear
		<div
			class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"
		></div>
	</div>
</div>
