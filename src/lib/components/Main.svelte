<script>
	import HeaderTermometro from '$lib/components/HeaderTermometro.svelte';
	import BarPanel from '$lib/components/BarPanel.svelte';
	import SidebarPanel from '$lib/components/SideBarPanel.svelte';
	import MobileVoteControls from '$lib/components/MobileVoteControls.svelte';
	import Help from '$lib/components/Help.svelte';
	import { Mail } from 'lucide-svelte';

	let showDrawer = false;
	let showHelpDrawer = false;
</script>

<div class="min-h-screen bg-[#F8FAFC] text-gray-900">
	<!-- Contenedor centrado vertical/horizontal -->
	<div class="flex min-h-screen flex-col justify-center px-3 sm:px-6 lg:px-8">
		<!-- Bloque centrado (Header + Layout) -->
		<div class="mx-auto w-full max-w-[1600px]">
			<!-- Header a ancho completo del layout -->
			<div class="mb-3">
				<HeaderTermometro />
			</div>

			<!-- Layout principal -->
			<div
				class="grid w-full grid-cols-1 gap-y-4
                 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:gap-x-4 lg:gap-y-6"
			>
				<!-- Columna izquierda: gráfico -->
				<div class="relative">
					<BarPanel onOpenHelp={() => (showHelpDrawer = true)} />

					<!-- Mobile vote controls at bottom of BarPanel (thumb zone) -->
					<div class="mt-3 lg:hidden">
						<MobileVoteControls onOpenDrawer={() => (showDrawer = true)} />
					</div>
				</div>

				<!-- Columna derecha: sidebar (desktop) -->
				<aside class="hidden self-center lg:block">
					<SidebarPanel />
				</aside>
			</div>
		</div>
	</div>

	<!-- Drawer móvil -->
	{#if showDrawer}
		<div class="fixed inset-0 z-50">
			<button
				class="absolute inset-0 bg-black/40"
				on:click={() => (showDrawer = false)}
				aria-label="Cerrar panel"
			></button>
			<div
				class="xs:w-[360px] absolute top-0 right-0 h-full w-[88%] overflow-y-auto bg-white p-4 shadow-xl"
			>
				<div class="mb-2 flex items-center justify-between">
					<h2 class="text-base font-semibold">Filtros & KPIs</h2>
					<button class="text-sm text-gray-600" on:click={() => (showDrawer = false)}>
						Cerrar
					</button>
				</div>
				<SidebarPanel />
			</div>
		</div>
	{/if}


	<!-- Mobile Help Drawer -->
	{#if showHelpDrawer}
		<div class="fixed inset-0 z-[70] flex sm:hidden" aria-modal="true" role="dialog">
			<!-- Overlay -->
			<button
				class="absolute inset-0 bg-black/40 cursor-default"
				on:click={() => (showHelpDrawer = false)}
				aria-label="Cerrar"
			></button>

			<!-- Drawer -->
			<div
				role="dialog"
				aria-label="Ayuda del simulador"
				class="relative ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-xl ring-1 ring-gray-200 sm:max-w-sm"
			>
				<!-- Header fijo -->
				<div class="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
					<h2 class="text-sm font-semibold text-gray-900">Cómo usar el simulador</h2>
					<button
						on:click={() => (showHelpDrawer = false)}
						class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md hover:bg-gray-100 focus:outline-none"
						aria-label="Cerrar ayuda"
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
							Usa los controles de + y - para redistribuir votos entre partidos. El termómetro central refleja el total agregado.
						</p>
					</section>

					<section>
						<h3 class="mb-1 text-[13px] font-semibold text-gray-900">Destino</h3>
						<p>
							Elige el <span class="font-medium">destino</span> (PDC o LIBRE) en el selector. Si reduces "Nulo", se suma al destino.
						</p>
					</section>

					<section>
						<h3 class="mb-1 text-[13px] font-semibold text-gray-900">Supuestos y límites</h3>
						<ul class="list-inside list-disc space-y-1 text-gray-700">
							<li>
								<span class="font-medium">Blanco:</span> no varía, pues históricamente ha sido muy estable.
							</li>
							<li>
								<span class="font-medium">Nulo:</span> no puede subir; se asume que tenderá a reducirse por la declaración de Evo que sugiere liberación del voto nulo.
							</li>
							<li>
								<span class="font-medium">Nulo (mínimo):</span> se fijó en el promedio de elecciones nacionales como límite inferior.
							</li>
							<li>
								<span class="font-medium">Padrón electoral:</span> se mantiene fijo; el TSE indicó que se usará el mismo de la primera vuelta.
							</li>
							<li>
								<span class="font-medium">Participación:</span> se conserva igual; es decir, el número de votos emitidos totales permanece constante.
							</li>
							<li>
								<span class="font-medium">Variable:</span> únicamente se puede modificar la distribución de los votos válidos.
							</li>
						</ul>
					</section>

					<!-- Footer con autor -->
					<section class="mt-6 border-t border-gray-200 pt-4">
						<p class="text-[13px] text-gray-600">Autor:</p>
						<div class="mt-1 flex items-center gap-2 text-gray-700">
							<span class="font-medium">Rafa Lopez</span>
							<a
								href="mailto:lopezvalverde.rafael@gmail.com"
								class="flex items-center gap-1 text-gray-600 transition hover:text-gray-900"
							>
								<Mail class="h-4 w-4" />
							</a>
						</div>
					</section>
				</div>
			</div>
		</div>
	{/if}

	<!-- Desktop Help (still uses Help component) -->
	<div class="hidden sm:block">
		<Help />
	</div>
</div>
