export function formatAxis(value) {
	if (value == null || isNaN(value)) return '—';

	const abs = Math.abs(value);

	if (abs >= 1_000_000) {
		// Millones
		return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
	} else if (abs >= 1_000) {
		// Miles
		return (value / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
	} else {
		// Menores a 1000 → número normal
		return value.toString();
	}
}
