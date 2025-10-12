<script>
	import { createEventDispatcher } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { spring } from 'svelte/motion';

	export let name;
	export let color;
	export let votos = 0;
	export let axisMax = 2500000;
	export let pct = 0;

	// límites
	export let minVotos = 0;
	export let maxVotos = Number.POSITIVE_INFINITY;
	export let baseVotos = votos;
	export let allowAboveBaseline = false;

	const dispatch = createEventDispatcher();

	// tween compartido SOLO para barra y label
	// const wPctTween = tweened(0, { duration: 300, easing: cubicOut });

	const wPctTween = spring(0, {
		stiffness: 1 / 30, // más bajo = más flojo
		damping: 0.25 // más bajo = rebota más
	});
	// tween independientes para los números
	const votosTween = tweened(0, { duration: 300, easing: cubicOut });
	const pctTween = tweened(0, { duration: 300, easing: cubicOut });

	// reactivos: actualizan interpolaciones al cambiar props
	$: {
		const w = axisMax ? (votos / axisMax) * 100 : 0;
		wPctTween.set(w); // ancho de barra y posición label
		votosTween.set(votos); // valor numérico
		pctTween.set(pct); // porcentaje
	}

	// Ghost bar (baseline) for visual reference
	$: baseWidthPct = axisMax ? (baseVotos / axisMax) * 100 : 0;

	let hitEl;
	let dragging = false;
	let raf = null;

	const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
	function clientXToPct(clientX) {
		const rect = hitEl.getBoundingClientRect();
		const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
		return ratio * 100;
	}
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

	const nfPctBig = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	});
	const nfInt = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	});
</script>

<div class="grid items-center gap-1" style="grid-template-columns: 5rem 1fr;">
	<!-- Nombre -->
	<div class="w-full truncate pr-0.5 text-right text-xs font-medium text-gray-800 sm:text-sm">
		{name}
	</div>

	<!-- Barra -->
	<div class="relative h-12 sm:h-13">
		<!-- Ghost bar (baseline reference) -->
		<div
			class="absolute inset-y-1 left-0 rounded-r-md opacity-20"
			style="background:{color}; width: {baseWidthPct}%;"
		></div>

		<!-- Actual bar -->
		<div
			class="absolute inset-y-1 left-0 rounded-r-md"
			style="background:{color}; width: {$wPctTween}%;"
		></div>

		<!-- Label -->
		<div
			class="pointer-events-none absolute top-1/2 tabular-nums"
			style="
				left: {$wPctTween}%;
				transform: translate(6px, -50%);
			"
		>
			<div class="text-xs font-semibold text-gray-900 sm:text-sm">{nfPctBig.format($pctTween)}%</div>
			<div class="text-[10px] text-gray-500 sm:text-xs">{nfInt.format($votosTween)}</div>
		</div>

		<!-- capa interactiva -->
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
