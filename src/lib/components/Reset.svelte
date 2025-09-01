<script>
	import { RotateCcw } from 'lucide-svelte';

	import { resetAllStores } from '$lib/stores/nuevo';

	function resetAll() {
		resetAllStores(); // sin recargar la página
	}

	let showTip = false;
	let pressTimer = null;

	const show = () => (showTip = true);
	const hide = () => (showTip = false);

	function onPointerDown() {
		if (pressTimer) return;
		pressTimer = setTimeout(() => {
			showTip = true;
			pressTimer = null;
		}, 600);
	}

	function onPointerUpOrCancel() {
		if (pressTimer) {
			clearTimeout(pressTimer);
			pressTimer = null;
		}
		setTimeout(() => (showTip = false), 120);
	}
</script>

<div class="fixed right-4 bottom-4 z-50 select-none">
	<button
		on:click={resetAll}
		on:mouseenter={show}
		on:mouseleave={hide}
		on:focus={show}
		on:blur={hide}
		on:pointerdown={onPointerDown}
		on:pointerup={onPointerUpOrCancel}
		on:pointercancel={onPointerUpOrCancel}
		class="group relative flex h-12 w-12 cursor-pointer items-center justify-center
             rounded-full bg-white shadow-md ring-1 ring-gray-300
             transition hover:bg-gray-100 hover:shadow-lg
             focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400
             active:scale-95"
		aria-label="Resetear"
	>
		<RotateCcw class="h-6 w-6 text-gray-700 transition group-hover:text-gray-900" />

		<!-- Tooltip -->
		<span
			class="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2
               translate-y-1 rounded-md bg-gray-900 px-2 py-1 text-xs text-white
               opacity-0 shadow-md transition-all
               duration-200 ease-out
               group-hover:translate-y-0 group-hover:opacity-100
               {showTip ? 'translate-y-0 opacity-100' : ''}"
		>
			Resetear
		</span>
	</button>
</div>
