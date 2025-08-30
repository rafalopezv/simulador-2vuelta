<script>
	import HeaderTermometro from '$lib/components/HeaderTermometro.svelte';
	import BarPanel from '$lib/components/BarPanel.svelte';
	import SidebarPanel from '$lib/components/SideBarPanel.svelte';
	let showDrawer = false;
</script>

<div class="min-h-screen bg-[#F8FAFC] pt-4 text-gray-900 sm:pt-8 lg:pt-4">
	<!-- Termómetro siempre centrado y ancho completo -->
	<div class="">
		<HeaderTermometro />
	</div>

	<!-- Botón para abrir sidebar en móvil -->
	<div class="mt-3 px-4 sm:px-6 lg:hidden">
		<button
			class="w-full rounded-lg bg-gray-900 px-3 py-2 text-sm text-white"
			on:click={() => (showDrawer = true)}
		>
			Filtros & KPIs
		</button>
	</div>

	<!-- Layout principal -->
	<div
		class="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-y-4 px-4 py-4
             sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:gap-x-4 lg:gap-y-6 lg:px-8 lg:py-6"
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

	<!-- Drawer móvil -->
	{#if showDrawer}
		<div class="fixed inset-0 z-50">
			<div class="absolute inset-0 bg-black/40" on:click={() => (showDrawer = false)}></div>
			<div
				class="xs:w-[360px] absolute top-0 right-0 h-full w-[88%] overflow-y-auto bg-white p-4 shadow-xl"
			>
				<div class="mb-2 flex items-center justify-between">
					<h2 class="text-base font-semibold">Filtros & KPIs</h2>
					<button class="text-sm text-gray-600" on:click={() => (showDrawer = false)}>Cerrar</button
					>
				</div>
				<SidebarPanel />
			</div>
		</div>
	{/if}
</div>
