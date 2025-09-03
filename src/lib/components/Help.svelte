<script>
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { Mail } from 'lucide-svelte';

	let open = false;

	const DUR_OVERLAY = 160;
	const DUR_DRAWER = 220;

	function onKeydown(e) {
		if (e.key === 'Escape') open = false;
	}
</script>

<svelte:window on:keydown={onKeydown} />

<!-- Botón flotante de ayuda (icono SVG minimal) -->
<div class="fixed right-4 bottom-20 z-50">
	<button
		on:click={() => (open = true)}
		class="flex h-10 w-10 cursor-pointer items-center justify-center
             rounded-full bg-white shadow-md ring-1 ring-gray-300
             transition hover:bg-gray-100 hover:shadow-lg
             focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
		aria-label="Ayuda"
		title="Cómo usar"
	>
		<!-- INFO ICON (simple, monocromo) -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width="18"
			height="18"
			fill="none"
			stroke="currentColor"
			stroke-width="1.6"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="text-gray-700"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="9" />
			<line x1="12" y1="10" x2="12" y2="16" />
			<circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
		</svg>
	</button>
</div>

{#if open}
	<!-- Contenedor modal -->
	<div class="fixed inset-0 z-[60] flex" aria-modal="true" role="dialog">
		<!-- Overlay -->
		<div
			class="absolute inset-0 bg-black/40"
			on:click={() => (open = false)}
			transition:fade={{ duration: DUR_OVERLAY, easing: cubicOut }}
		/>

		<!-- Drawer a la derecha -->
		<aside
			role="dialog"
			aria-label="Ayuda del simulador"
			class="relative ml-auto h-full w-full max-w-md bg-white shadow-xl ring-1 ring-gray-200 sm:max-w-sm"
			in:fade={{ duration: DUR_DRAWER, easing: cubicOut }}
			out:fade={{ duration: DUR_DRAWER, easing: cubicOut }}
			style="transform: translateX(0);"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
				<h2 class="text-sm font-semibold text-gray-900">Cómo usar el simulador</h2>
				<button
					on:click={() => (open = false)}
					class="inline-flex h-8 w-8 cursor-pointer items-center justify-center
                   rounded-md hover:bg-gray-100 focus:outline-none focus-visible:ring-2
                   focus-visible:ring-gray-400"
					aria-label="Cerrar ayuda"
					title="Cerrar"
				>
					<!-- X minimal -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						width="16"
						height="16"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="text-gray-700"
					>
						<line x1="6" y1="6" x2="18" y2="18" />
						<line x1="18" y1="6" x2="6" y2="18" />
					</svg>
				</button>
			</div>

			<!-- Contenido -->
			<div class="space-y-4 px-4 py-4 text-sm text-gray-700">
				<section>
					<h3 class="mb-1 text-[13px] font-semibold text-gray-900">Idea general</h3>
					<p>
						Arrastra las barras por partido de la primera vuelta para redistribuir votos. El
						termómetro central refleja el total agregado.
					</p>
				</section>

				<section>
					<h3 class="mb-1 text-[13px] font-semibold text-gray-900">Destino</h3>
					<p>
						Elige el <span class="font-medium">destino</span> (PDC o LIBRE) y el movimiento de votos
						se aplicará allí. Si sube “Nulo”, se descuenta del destino.
					</p>
				</section>

				<section>
					<h3 class="mb-1 text-[13px] font-semibold text-gray-900">Ámbitos</h3>
					<p>
						Explora por <span class="font-medium">Exterior, Nacional, Departamentos</span> y
						<span class="font-medium">Capitales</span>. Los cambios se agregan al total global.
					</p>
				</section>

				<section>
					<h3 class="mb-1 text-[13px] font-semibold text-gray-900">Límites</h3>
					<ul class="list-inside list-disc text-gray-700">
						<li>PDC y LIBRE pueden subir o bajar.</li>
						<li>Otros partidos no suben por encima de su base.</li>
						<li>Nulo tiene mínimo (p. ej. 3.5%) y no supera su base.</li>
					</ul>
				</section>

				<section class="rounded-lg bg-gray-50 p-3 ring-1 ring-gray-200">
					<p class="mb-2 text-[13px] text-gray-600">¿Dudas o feedback? Contáctanos:</p>
					<div class="flex items-center gap-4">
						<!-- Mail -->
						<a
							href="mailto:lopezvalverde.rafael@gmail.com"
							class="flex items-center gap-2 text-gray-700 transition hover:text-gray-900"
						>
							<Mail />
						</a>
					</div>
				</section>
			</div>
		</aside>
	</div>
{/if}
