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

<!-- Botón flotante de ayuda -->
<div class="fixed top-4 right-4 z-50 sm:top-6">
	<button
		on:click={() => (open = true)}
		class="relative flex h-[27px] w-[27px] cursor-pointer items-center justify-center
             rounded-full bg-[#333333] shadow-md ring-1 ring-gray-200
             transition-transform duration-200
             hover:scale-105 hover:shadow-lg
             focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400
             active:scale-95"
		aria-label="Ayuda"
		title="Cómo usar"
	>
		<!-- Capas decorativas -->
		<span
			class="pointer-events-none absolute inset-0 grid cursor-pointer place-items-center"
			aria-hidden="true"
		>
			<span class="h-3 w-3 cursor-pointer rounded-full bg-white"></span>
			<span class="absolute h-6 w-6 cursor-pointer rounded-full bg-white"></span>
		</span>

		<!-- Icono -->
		<img src="/info.svg" alt="info" class="relative z-10 h-[22px] w-[22px]" />
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

		<!-- Drawer con scroll interno -->
		<aside
			role="dialog"
			aria-label="Ayuda del simulador"
			class="relative ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-xl ring-1 ring-gray-200 sm:max-w-sm"
			in:fade={{ duration: DUR_DRAWER, easing: cubicOut }}
			out:fade={{ duration: DUR_DRAWER, easing: cubicOut }}
		>
			<!-- Header fijo -->
			<div
				class="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3"
			>
				<h2 class="text-sm font-semibold text-gray-900">Cómo usar el simulador</h2>
				<button
					on:click={() => (open = false)}
					class="inline-flex h-8 w-8 cursor-pointer items-center justify-center
                     rounded-md hover:bg-gray-100 focus:outline-none focus-visible:ring-2
                     focus-visible:ring-gray-400"
					aria-label="Cerrar ayuda"
					title="Cerrar"
				>
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

			<!-- Contenido scrollable -->
			<div class="flex-1 space-y-5 overflow-y-auto px-4 py-4 text-sm text-gray-700">
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
					<h3 class="mb-1 text-[13px] font-semibold text-gray-900">Supuestos y límites</h3>
					<ul class="list-inside list-disc space-y-1 text-gray-700">
						<li>
							<span class="font-medium">Blanco:</span> no varía, pues históricamente ha sido muy estable.
						</li>
						<li>
							<span class="font-medium">Nulo:</span> no puede subir; se asume que tenderá a reducirse
							por la declaración de Evo que sugiere liberación del voto nulo.
						</li>
						<li>
							<span class="font-medium">Nulo (mínimo):</span> se fijó en el promedio de elecciones nacionales
							como límite inferior.
						</li>
						<li>
							<span class="font-medium">Padrón electoral:</span> se mantiene fijo; el TSE indicó que
							se usará el mismo de la primera vuelta.
						</li>
						<li>
							<span class="font-medium">Participación:</span> se conserva igual; es decir, el número
							de votos emitidos totales permanece constante.
						</li>
						<li>
							<span class="font-medium">Variable:</span> únicamente se puede modificar la distribución
							de los votos válidos.
						</li>
					</ul>
				</section>

				<!-- Footer con autor -->
				<section class="mt-6 border-t border-gray-200 pt-4">
					<p class="text-[13px] text-gray-600">Autor:</p>
					<div class="mt-1 flex items-center gap-2 text-gray-700">
						<span class="font-medium">Rafa Lopez</span><br />
						<a
							href="mailto:lopezvalverde.rafael@gmail.com"
							class="flex items-center gap-1 text-gray-600 transition hover:text-gray-900"
						>
							<Mail class="h-4 w-4" />
							<!-- 👈 icono Lucide -->
							<span></span>
						</a>
					</div>
				</section>
			</div>
		</aside>
	</div>
{/if}
