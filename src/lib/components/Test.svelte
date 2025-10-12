<!-- +page.svelte -->
<script>
	import HeaderTermometro from '$lib/components/HeaderTermometro.svelte';
	import BarPanel from '$lib/components/BarPanel.svelte';
	import SidebarPanel from '$lib/components/SideBarPanel.svelte';
	let showDrawer = false;
</script>

<!-- Contenedor de página: ocupa 100% del alto y centra el bloque -->
<div class="min-h-dvh bg-[#F5f5f7] text-gray-900">
	<div
		class="mx-auto flex min-h-dvh w-full max-w-[1600px] flex-col
                justify-center px-4 sm:px-6 lg:px-8"
	>
		<!-- Bloque centrado (termómetro + grid) -->
		<div class="flex flex-col gap-3 lg:gap-4">
			<header class="pt-3 sm:pt-4 lg:pt-3">
				<HeaderTermometro />
			</header>

			<div class="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
				<div><BarPanel /></div>
				<aside class="hidden self-start lg:block"><SidebarPanel /></aside>
			</div>
		</div>
	</div>
</div>
