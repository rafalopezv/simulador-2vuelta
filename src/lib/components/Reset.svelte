<script>
	import { RotateCcw } from 'lucide-svelte';
	import { resetAllStores } from '$lib/stores/nuevo';

	function resetAll() {
		resetAllStores(); // resetea sin recargar la página
	}
</script>

<div class="w-full">
	<!-- Desktop / tablets: botón rectangular -->
	<button
		on:click={resetAll}
		class="hidden w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300
         bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition
         hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2
         focus-visible:ring-gray-400 sm:flex"
	>
		<RotateCcw class="h-4 w-4" />
		<span>Resetear</span>
	</button>

	<button
		on:click={resetAll}
		class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-300
         bg-white shadow-sm transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2
         focus-visible:ring-gray-400 sm:hidden"
		aria-label="Resetear"
		title="Resetear"
	>
		<RotateCcw class="h-5 w-5 text-gray-700" />
	</button>
</div>
