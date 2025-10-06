<script>
	import { destinoGlobal } from '$lib/stores/nuevo';

	// invertimos el set:
	const setLeft = () => ($destinoGlobal = 'A'); // izquierda -> A
	const setRight = () => ($destinoGlobal = 'B'); // derecha -> B

	function onKey(e) {
		if (e.key === 'ArrowLeft') setLeft();
		if (e.key === 'ArrowRight') setRight();
		if (e.key === ' ' || e.key === 'Enter') {
			$destinoGlobal === 'A' ? setRight() : setLeft();
			e.preventDefault();
		}
	}
</script>

<div class="inline-flex overflow-hidden rounded-lg" role="group" tabindex="0" on:keydown={onKey}>
	<!-- Botón turquesa (izquierda ahora setea A) -->
	<div class="group relative">
		<button
			on:click={setLeft}
			class={`btn3d btn-left-turq ${$destinoGlobal === 'A' ? 'active' : ''}`}
		>
			PDC
		</button>
		<!-- Tooltip -->
		<div class="tooltip">Tooltip demo</div>
	</div>

	<!-- Botón rojo-salmon (derecha ahora setea B) -->
	<div class="group relative">
		<button
			on:click={setRight}
			class={`btn3d btn-right-red ${$destinoGlobal === 'B' ? 'active' : ''}`}
		>
			LIBRE
		</button>
		<!-- Tooltip -->
		<div class="tooltip">Tooltip demo</div>
	</div>
</div>

<style>
	.btn3d {
		position: relative;
		top: -6px;
		border: 0;
		transition:
			top 120ms ease,
			box-shadow 120ms ease,
			background-color 120ms ease;
		padding: 10px 28px;
		font-weight: 600;
		cursor: pointer;
		color: #fff;
		z-index: 1;
	}
	.btn3d:active,
	.btn3d.active {
		top: 2px;
	}

	/* Hover aplastamiento mínimo */

	/* Botón levantado (no activo) debe estar por encima para que su sombra lateral se vea */
	.btn3d:not(.active) {
		z-index: 2;
		/* 👉 ajuste de color inactivo */
		background-color: #e5e7eb; /* gris claro */
		color: #6b7280; /* gris medio para el texto */
	}

	/* --- Izquierda turquesa (#4AA5A3) --- */
	.btn-left-turq {
		border-top-left-radius: 8px;
		border-bottom-left-radius: 8px;
		background-color: #4aa5a3;
		box-shadow:
			inset 0 0 0 1px #3c8f8d,
			inset 0 0 0 2px rgba(255, 255, 255, 0.15),
			0 8px 0 0 #367d7b,
			0 8px 8px 1px rgba(0, 0, 0, 0.4);
	}
	.btn-left-turq:not(.active) {
		box-shadow:
			inset 0 0 0 1px #d1d5db,
			0 8px 0 0 #d1d5db,
			0 8px 8px 1px rgba(0, 0, 0, 0.2),
			3px 0 4px rgba(0, 0, 0, 0.25);
	}
	.btn-left-turq.active,
	.btn-left-turq:active {
		box-shadow:
			inset 0 0 0 1px #3c8f8d,
			inset 0 0 0 1px rgba(255, 255, 255, 0.15),
			0 1px 3px 1px rgba(0, 0, 0, 0.3);
		background-color: #4aa5a3;
		color: #fff;
	}

	/* --- Derecha rojo-salmon (#F06B66) --- */
	.btn-right-red {
		border-top-right-radius: 8px;
		border-bottom-right-radius: 8px;
		background-color: #f06b66;
		box-shadow:
			inset 0 0 0 1px #d45a56,
			inset 0 0 0 2px rgba(255, 255, 255, 0.15),
			0 8px 0 0 #c24b47,
			0 8px 8px 1px rgba(0, 0, 0, 0.4);
	}
	.btn-right-red:not(.active) {
		box-shadow:
			inset 0 0 0 1px #d1d5db,
			0 8px 0 0 #d1d5db,
			0 8px 8px 1px rgba(0, 0, 0, 0.2),
			-3px 0 4px rgba(0, 0, 0, 0.25);
	}
	.btn-right-red.active,
	.btn-right-red:active {
		box-shadow:
			inset 0 0 0 1px #d45a56,
			inset 0 0 0 1px rgba(255, 255, 255, 0.15),
			0 1px 3px 1px rgba(0, 0, 0, 0.3);
		background-color: #f06b66;
		color: #fff;
	}

	/* --- Tooltip elegante --- */
	.tooltip {
		position: absolute;
		bottom: 110%; /* sobre el botón */
		left: 50%;
		transform: translateX(-50%) translateY(10px);
		background: rgba(0, 0, 0, 0.85);
		color: #fff;
		padding: 4px 8px;
		border-radius: 6px;
		font-size: 12px;
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 180ms ease,
			transform 180ms ease;
	}

	/* Flecha del tooltip */
	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		margin-left: -4px;
		border-width: 4px;
		border-style: solid;
		border-color: rgba(0, 0, 0, 0.85) transparent transparent transparent;
	}

	.btn3d:focus {
		outline: none;
		box-shadow: none; /* si también quieres que no se sume ninguna sombra extra */
	}
</style>
