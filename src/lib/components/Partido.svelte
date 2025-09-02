<script>
	import { createEventDispatcher } from 'svelte';

	export let name;
	export let color;
	export let votos = 0;
	export let axisMax = 2500000; // se puede sobrescribir

	// % respecto a VÁLIDOS (lo pasas desde el panel)
	export let pct = 0;

	// 🔒 límites de arrastre
	export let minVotos = 0;
	export let maxVotos = Number.POSITIVE_INFINITY;
	export let baseVotos = votos; // “nivel de renderización”/baseline
	export let allowAboveBaseline = false; // solo true para PDC/LIBRE

	const dispatch = createEventDispatcher();

	// ancho de la barra en %
	$: wPct = axisMax ? (votos / axisMax) * 100 : 0;
	$: nearRight = wPct >= 96;

	let hitEl;
	let dragging = false;
	let raf = null;

	const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

	function clientXToPct(clientX) {
		const rect = hitEl.getBoundingClientRect();
		const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
		return ratio * 100;
	}

	// ⛔️ aquí aplicamos los límites
	function pctToVotos(p) {
		const v = Math.round((p / 100) * (axisMax || 0));
		const techo = allowAboveBaseline
			? Math.min(maxVotos, axisMax || Infinity)
			: Math.min(maxVotos, baseVotos ?? Infinity, axisMax || Infinity);
		return clamp(v, minVotos, techo);
	}

	function emitFromClientX(clientX) {
		const p = clientXToPct(clientX);
		const v = pctToVotos(p);
		dispatch('update', { name, votos: v });
	}

	function onPointerDown(e) {
		dragging = true;
		hitEl.setPointerCapture?.(e.pointerId);
		e.preventDefault();
		emitFromClientX(e.clientX);
	}

	function onPointerMove(e) {
		if (!dragging) return;
		if (raf) return;
		raf = requestAnimationFrame(() => {
			raf = null;
			emitFromClientX(e.clientX);
		});
	}

	function onPointerUp(e) {
		if (!dragging) return;
		dragging = false;
		hitEl.releasePointerCapture?.(e.pointerId);
	}

	// formato (en-US: miles con coma, decimales con punto)
	const nfPctBig = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	});
	const nfInt = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	});
</script>

<div class="grid items-center gap-3" style="grid-template-columns: 7rem 1fr;">
	<!-- Nombre -->
	<div class="w-full truncate pr-1 text-right text-xs font-medium text-gray-800 sm:text-sm">
		{name}
	</div>

	<!-- Barra -->
	<div class="relative h-10 sm:h-12">
		<div
			class="absolute inset-y-1 left-0 rounded-r-md"
			style="
        width: {wPct}%;
        background: {color};
        transition: width 300ms cubic-bezier(0.22, 0.61, 0.36, 1);
      "
		></div>

		<!-- Label: % válidos (grande) + votos (debajo) -->
		<div
			class="pointer-events-none absolute top-1/2 rounded-lg bg-white tabular-nums"
			style="
        left: {wPct}%;
        transform: translate({nearRight ? '-10px' : '6px'}, -50%);
        text-align: {nearRight ? 'right' : 'left'};
        max-width: 40ch;
      "
		>
			<div class="font-semibold text-gray-900">{nfPctBig.format(pct)}%</div>
			<div class="text-sm text-gray-500">{nfInt.format(votos)}</div>
		</div>

		<!-- Capa interactiva -->
		<div
			bind:this={hitEl}
			class="absolute inset-0 z-10 cursor-ew-resize select-none"
			on:pointerdown={onPointerDown}
			on:pointermove={onPointerMove}
			on:pointerup={onPointerUp}
			on:pointercancel={onPointerUp}
			on:lostpointercapture={onPointerUp}
		></div>
	</div>
</div>
