import { writable, get } from 'svelte/store';
import { interpolateNumber } from 'd3-interpolate';

const createAxis = () => {
	const state = writable({
		currentStart: 0,
		targetStart: 0,
		windowSize: 2_000_000,
		step: 400_000,
		count: 6,
		animMs: 450,
		easing: (t) => 1 - Math.pow(1 - t, 3)
	});

	let raf = null;
	let t0 = 0;
	let interp = null;

	function tick() {
		if (typeof window === 'undefined') return; // SSR guard
		const s = get(state);
		const now = performance.now();
		const t = Math.min(1, (now - t0) / s.animMs);
		const v = s.easing(t);
		const start = interp ? interp(v) : s.currentStart;
		state.set({ ...s, currentStart: start });
		if (t < 1) raf = window.requestAnimationFrame(tick);
		else raf = null;
	}

	function panTo(newStart) {
		const s = get(state);
		if (Math.abs(newStart - s.currentStart) < 1) return;
		state.set({ ...s, targetStart: newStart });
		t0 = typeof window !== 'undefined' ? performance.now() : 0;
		interp = interpolateNumber(s.currentStart, newStart);
		if (typeof window !== 'undefined' && !raf) {
			raf = window.requestAnimationFrame(tick);
		}
	}

	function ensureVisible(peak, opts = {}) {
		const s = get(state);
		const padLeft = opts.padLeft ?? 0.02;
		const padRight = opts.padRight ?? 0.15;
		const leftLim = s.currentStart + s.windowSize * padLeft;
		const rightLim = s.currentStart + s.windowSize * (1 - padRight);

		if (peak <= leftLim) {
			const target = Math.max(0, peak - s.windowSize * 0.15);
			panTo(target);
		} else if (peak >= rightLim) {
			const target = Math.max(0, peak - s.windowSize * 0.85);
			panTo(target);
		}
	}

	return { subscribe: state.subscribe, ensureVisible };
};

export const axis = createAxis();
