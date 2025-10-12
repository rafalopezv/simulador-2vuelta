<script>
	import HeaderTermometro from '$lib/components/HeaderTermometro.svelte';
	import BarPanel from '$lib/components/BarPanel.svelte';
	import SidebarPanel from '$lib/components/SideBarPanel.svelte';
	import Reset from '$lib/components/Reset.svelte';
	import MobileVoteControls from '$lib/components/MobileVoteControls.svelte';
	import Help from '$lib/components/Help.svelte';
	let showDrawer = false;
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

			<!-- Mobile vote controls with pressure sensitivity -->
			<div class="mb-3">
				<MobileVoteControls onOpenDrawer={() => (showDrawer = true)} />
			</div>

			<!-- Layout principal -->
			<div
				class="grid w-full grid-cols-1 gap-y-4
                 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:gap-x-4 lg:gap-y-6"
			>
				<!-- Columna izquierda: gráfico -->
				<div>
					<BarPanel />
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

	<!-- Mobile floating buttons at bottom with backdrop blur -->
	<div class="fixed bottom-4 right-4 z-50 flex items-center gap-2 sm:hidden">
		<div class="rounded-xl bg-white/80 p-1.5 shadow-lg backdrop-blur-md">
			<Help inline={true} />
		</div>
		<div class="rounded-xl bg-white/80 p-1.5 shadow-lg backdrop-blur-md">
			<Reset />
		</div>
	</div>
</div>
