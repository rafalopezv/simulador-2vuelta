<script>
	import { spring } from 'svelte/motion';
	import { Play, MousePointerClick } from 'lucide-svelte';
	import { onDestroy } from 'svelte';

	const scale = spring(1, {
		stiffness: 0.2,
		damping: 0.4
	});

	let btnRef;
	let isPlaying = false;

	// Emit event to trigger demo in parent
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let isMobile = false;

	function playDemo() {
		if (isPlaying) return;
		isPlaying = true;
		dispatch('play');

		// Reset after demo completes (8 seconds total - doubled)
		setTimeout(() => {
			isPlaying = false;
		}, 8000);
	}
</script>

<!-- Demo button -->
<div class="group relative inline-block">
	<button
		bind:this={btnRef}
		on:mousedown={() => scale.set(0.85)}
		on:mouseup={() => scale.set(1)}
		on:mouseleave={() => scale.set(1)}
		on:click={playDemo}
		disabled={isPlaying}
		class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200
		       bg-white shadow-sm transition hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-wait"
		style="transform: scale({$scale});"
		aria-label="Ver demostración"
	>
		{#if isPlaying}
			<MousePointerClick class="h-5 w-5 text-gray-700 animate-pulse" />
		{:else}
			<Play class="h-5 w-5 text-gray-700" />
		{/if}
	</button>

	<!-- Tooltip -->
	<div
		class="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-md bg-gray-900
		       px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0
		       shadow-md transition group-focus-within:opacity-100 group-hover:opacity-100"
	>
		{isMobile ? 'Ver cómo funciona' : 'Ver demo de arrastre'}
		<div
			class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"
		></div>
	</div>
</div>
