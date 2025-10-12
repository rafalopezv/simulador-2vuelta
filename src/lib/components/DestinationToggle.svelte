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
	</div>

	<!-- Botón rojo-salmon (derecha ahora setea B) -->
	<div class="group relative">
		<button
			on:click={setRight}
			class={`btn3d btn-right-red ${$destinoGlobal === 'B' ? 'active' : ''}`}
		>
			LIBRE
		</button>
	</div>
</div>

<style>
	.btn3d {
		position: relative;
		top: -4px;
		border: 0;
		transition:
			top 120ms ease,
			box-shadow 120ms ease,
			background-color 120ms ease;
		padding: 6px 20px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		color: #fff;
		z-index: 1;
	}

	@media (min-width: 640px) {
		.btn3d {
			top: -6px;
			padding: 10px 28px;
			font-size: 1rem;
		}
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

	/* --- Izquierda turquesa (#3FA09D) --- */
	.btn-left-turq {
		border-top-left-radius: 6px;
		border-bottom-left-radius: 6px;
		background-color: #3fa09d;
		box-shadow:
			inset 0 0 0 1px #338884,
			inset 0 0 0 2px rgba(255, 255, 255, 0.15),
			0 5px 0 0 #2b7370,
			0 5px 6px 1px rgba(0, 0, 0, 0.4);
	}
	.btn-left-turq:not(.active) {
		box-shadow:
			inset 0 0 0 1px #d1d5db,
			0 5px 0 0 #d1d5db,
			0 5px 6px 1px rgba(0, 0, 0, 0.2),
			3px 0 4px rgba(0, 0, 0, 0.25);
	}

	@media (min-width: 640px) {
		.btn-left-turq {
			border-radius: 8px 0 0 8px;
			box-shadow:
				inset 0 0 0 1px #338884,
				inset 0 0 0 2px rgba(255, 255, 255, 0.15),
				0 8px 0 0 #2b7370,
				0 8px 8px 1px rgba(0, 0, 0, 0.4);
		}
		.btn-left-turq:not(.active) {
			box-shadow:
				inset 0 0 0 1px #d1d5db,
				0 8px 0 0 #d1d5db,
				0 8px 8px 1px rgba(0, 0, 0, 0.2),
				3px 0 4px rgba(0, 0, 0, 0.25);
		}
	}
	.btn-left-turq.active,
	.btn-left-turq:active {
		box-shadow:
			inset 0 0 0 1px #338884,
			inset 0 0 0 1px rgba(255, 255, 255, 0.15),
			0 1px 3px 1px rgba(0, 0, 0, 0.3);
		background-color: #3fa09d;
		color: #fff;
	}

	/* --- Derecha rojo-salmon (#F05B56) --- */
	.btn-right-red {
		border-top-right-radius: 6px;
		border-bottom-right-radius: 6px;
		background-color: #f05b56;
		box-shadow:
			inset 0 0 0 1px #d64942,
			inset 0 0 0 2px rgba(255, 255, 255, 0.15),
			0 5px 0 0 #c13a35,
			0 5px 6px 1px rgba(0, 0, 0, 0.4);
	}
	.btn-right-red:not(.active) {
		box-shadow:
			inset 0 0 0 1px #d1d5db,
			0 5px 0 0 #d1d5db,
			0 5px 6px 1px rgba(0, 0, 0, 0.2),
			-3px 0 4px rgba(0, 0, 0, 0.25);
	}

	@media (min-width: 640px) {
		.btn-right-red {
			border-radius: 0 8px 8px 0;
			box-shadow:
				inset 0 0 0 1px #d64942,
				inset 0 0 0 2px rgba(255, 255, 255, 0.15),
				0 8px 0 0 #c13a35,
				0 8px 8px 1px rgba(0, 0, 0, 0.4);
		}
		.btn-right-red:not(.active) {
			box-shadow:
				inset 0 0 0 1px #d1d5db,
				0 8px 0 0 #d1d5db,
				0 8px 8px 1px rgba(0, 0, 0, 0.2),
				-3px 0 4px rgba(0, 0, 0, 0.25);
		}
	}
	.btn-right-red.active,
	.btn-right-red:active {
		box-shadow:
			inset 0 0 0 1px #d64942,
			inset 0 0 0 1px rgba(255, 255, 255, 0.15),
			0 1px 3px 1px rgba(0, 0, 0, 0.3);
		background-color: #f05b56;
		color: #fff;
	}

	/* --- Tooltip elegante --- */

	.btn3d:focus {
		outline: none;
		box-shadow: none; /* si también quieres que no se sume ninguna sombra extra */
	}
</style>
