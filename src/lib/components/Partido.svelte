<script>
	import { createEventDispatcher } from 'svelte';

	export let name;
	export let color;
	export let votos;
	export let pct;
	export let axisMax;

	// límites opcionales
	export let minVotos = 0;
	export let maxVotos = Number.POSITIVE_INFINITY;
	export let baseVotos = votos;
	export let allowAboveBaseline = false;

	export let draggable = true;
	export let minStepPct = 0.1;

	export let animate = true;
	export let duration = 350;
	export let easing = 'cubic-bezier(0.22,0.61,0.36,1)';
	export let staggerIndex = 0;
	export let staggerStep = 40;

	const nf = new Intl.NumberFormat('es-BO');
	const d = createEventDispatcher();

	// ancho actual
	$: f = Math.max(0, Math.min(1, axisMax ? votos / axisMax : 0));
	$: wPct = f * 100;

	// baseline (gris detrás)
	$: fBase = Math.max(0, Math.min(1, axisMax ? (baseVotos ?? votos) / axisMax : 0));
	$: basePct = fBase * 100;

	// si está muy a la derecha, pegamos etiqueta
	$: nearRight = f >= 0.96;

	let hitEl;
	let dragging = false;
	let raf = null;

	const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

	function clientXToPct(clientX) {
		const rect = hitEl.getBoundingClientRect();
		const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
		let p = ratio * 100;
		if (minStepPct && minStepPct > 0) p = Math.round(p / minStepPct) * minStepPct;
		return clamp(p, 0, 100);
	}

	function pctToVotos(p) {
		const v = Math.round((p / 100) * (axisMax || 0));
		const max = allowAboveBaseline
			? Math.min(maxVotos, axisMax || Infinity)
			: Math.min(maxVotos, baseVotos ?? Infinity, axisMax || Infinity);
		return clamp(v, minVotos, max);
	}

	function emitFromClientX(clientX) {
		const p = clientXToPct(clientX);
		const v = pctToVotos(p);
		d('update', { name, votos: v, pct: p });
	}

	function onPointerDown(e) {
		if (!draggable) return;
		dragging = true;
		hitEl.setPointerCapture?.(e.pointerId);
		e.preventDefault();
		emitFromClientX(e.clientX);
	}

	function onPointerMove(e) {
		if (!dragging) return;
		if (raf) cancelAnimationFrame(raf);
		raf = requestAnimationFrame(() => {
			raf = null;
			emitFromClientX(e.clientX);
		});
	}

	function onPointerUp(e) {
		if (!dragging) return;
		dragging = false;
		hitEl.releasePointerCapture?.(e.pointerId);
		const p = clientXToPct(e.clientX);
		const v = pctToVotos(p);
		d('commit', { name, votos: v, pct: p });
	}

	$: delayMs = animate ? Math.max(0, (staggerIndex || 0) * (staggerStep || 0)) : 0;
	$: barTransition = dragging ? 'none' : `width ${duration}ms ${easing} ${delayMs}ms`;
	$: labelTransition = dragging
		? 'none'
		: `left ${duration}ms ${easing} ${delayMs}ms, transform ${duration}ms ${easing} ${delayMs}ms`;
</script>

<div class="grid items-center gap-3" style="grid-template-columns: var(--label-w, 7rem) 1fr;">
	<div class="w-full truncate pr-1 text-right text-xs font-medium text-gray-800 sm:text-sm">
		{name}
	</div>
	<div class="relative h-12 sm:h-12">
		<div
			class="pointer-events-none absolute inset-y-1 left-1 -z-10 rounded-r-[5px] bg-gray-100"
			style="width: calc({basePct}% - 0.25rem);"
		></div>
		<div
			class="absolute inset-y-1 left-1 rounded-r-[5px]"
			style="
        width: calc({wPct}% - 0.25rem);
        background: {color};
        transition: {barTransition};
        will-change: width;
      "
		></div>
		<div
			class="pointer-events-none absolute top-1/2 text-sm font-medium text-[#333333] tabular-nums sm:text-base"
			style="
        left: {wPct}%;
        transform: translate({nearRight ? '-10px' : '5px'}, -60%);
        text-align: {nearRight ? 'right' : 'left'};
        max-width: 40ch;
        transition: {labelTransition};
        will-change: left, transform;
      "
		>
			{nf.format(votos)} · {pct.toFixed(2)}%
		</div>
		<div
			bind:this={hitEl}
			class="absolute inset-0 z-20 {draggable ? 'cursor-ew-resize select-none' : ''}"
			on:pointerdown={onPointerDown}
			on:pointermove={onPointerMove}
			on:pointerup={onPointerUp}
			on:pointercancel={onPointerUp}
			on:lostpointercapture={onPointerUp}
		></div>
	</div>
</div>
