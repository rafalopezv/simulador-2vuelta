<script>
	import { onMount, tick } from 'svelte';

	export let items = []; // [{ label, value }]
	export let selected = ''; // value actual (bind:selected desde el padre)
	export let placeholder = 'Selecciona...';
	export let disabled = false;

	let open = false;
	let buttonEl;
	let listEl;
	let hoverIndex = -1;

	// Derivado: label visible según 'selected'
	$: selectedItem = items.find((it) => it.value === selected);
	$: visibleLabel = selectedItem ? selectedItem.label : '';

	function toggle() {
		if (disabled) return;
		open = !open;
		if (open) {
			// Enfoca la lista al abrir para permitir teclado
			tick().then(() => listEl?.focus());
			// Si hay seleccionado, coloca hover ahí
			const idx = items.findIndex((it) => it.value === selected);
			hoverIndex = idx >= 0 ? idx : -1;
		}
	}

	function close() {
		open = false;
		hoverIndex = -1;
	}

	function selectIndex(i) {
		const it = items[i];
		if (!it) return;
		selected = it.value; // actualiza el bind:selected
		const detail = { value: it.value, label: it.label };
		dispatchEvent('change', detail);
		close();
		// Devuelve el foco al botón
		buttonEl?.focus();
	}

	function onKeydown(e) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
			buttonEl?.focus();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			hoverIndex = Math.min(items.length - 1, hoverIndex < 0 ? 0 : hoverIndex + 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			hoverIndex = Math.max(0, hoverIndex < 0 ? items.length - 1 : hoverIndex - 1);
		} else if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (hoverIndex >= 0) selectIndex(hoverIndex);
		}
	}

	// Cerrar cuando el contenedor pierde foco (sin usar document)
	let containerEl;
	function onFocusOut(e) {
		if (!containerEl?.contains(e.relatedTarget)) close();
	}

	// Dispatcher liviano sin importar svelte/internal
	function dispatchEvent(name, detail) {
		const ev = new CustomEvent(name, { detail, bubbles: true });
		containerEl?.dispatchEvent(ev);
	}
</script>

<div bind:this={containerEl} class="relative inline-block w-full" on:focusout={onFocusOut}>
	<!-- Botón -->
	<button
		bind:this={buttonEl}
		type="button"
		class="flex w-full items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-sm
             text-gray-900 transition hover:bg-gray-200 focus:outline-none focus-visible:ring-2
             focus-visible:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
		aria-haspopup="listbox"
		aria-expanded={open}
		on:click={toggle}
		{disabled}
	>
		<span class="truncate">
			{visibleLabel || placeholder}
		</span>
		<span class="ml-2 text-gray-500">▾</span>
	</button>

	<!-- Lista -->
	{#if open}
		<ul
			bind:this={listEl}
			tabindex="0"
			role="listbox"
			class="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg bg-white p-1 text-sm shadow-lg ring-1 ring-gray-200 focus:outline-none"
			on:keydown={onKeydown}
		>
			{#each items as it, i}
				<li
					role="option"
					aria-selected={it.value === selected}
					class="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5
                   hover:bg-gray-100 focus:bg-gray-100
                   {it.value === selected ? 'bg-gray-50 font-medium' : ''}"
					on:mouseenter={() => (hoverIndex = i)}
					on:mousedown|preventDefault={() => selectIndex(i)}
				>
					<span class="truncate">{it.label}</span>
					{#if it.value === selected}
						<span class="ml-2 text-gray-500">✓</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	/* Opcional: fijar ancho igual al botón */
	ul {
		min-width: 100%;
	}
</style>
