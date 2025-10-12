<script>
	import { Minus, Plus, PanelRightOpen, ChevronDown } from 'lucide-svelte';
	import { partidos, nulo, FINALISTA_A_ID, FINALISTA_B_ID, destinoGlobal, recomputeAll, setNuloVotos, registrarRedistribucion } from '$lib/stores/nuevo';
	import { spring } from 'svelte/motion';

	export let onOpenDrawer = () => {};

	// Selected party to transfer FROM
	let selectedPartyId = null;
	let showOriginDropdown = false;
	let showDestDropdown = false;

	// Destination options
	const destinationOptions = [
		{ id: 'A', name: 'PDC', color: '#3FA09D' },
		{ id: 'B', name: 'LIBRE', color: '#F05B56' }
	];

	// Get all transferable parties (including finalists + Nulo)
	$: transferableParties = [
		...$partidos, // Now includes PDC and LIBRE
		{ id: 'NULO', name: 'Nulo', votos: $nulo?.votos || 0, color: '#111827' }
	];

	// Auto-select first party if none selected
	$: if (!selectedPartyId && transferableParties.length > 0) {
		selectedPartyId = transferableParties[0].id;
	}

	$: selectedParty = transferableParties.find(p => p.id === selectedPartyId);
	$: selectedDestination = destinationOptions.find(d => d.id === $destinoGlobal);

	// Check if current selection is invalid (can't transfer to yourself)
	$: isInvalidTransfer =
		(selectedPartyId === 'PDC' && $destinoGlobal === 'A') ||
		(selectedPartyId === 'LIB' && $destinoGlobal === 'B');

	// Spring for button press animation
	const scaleA = spring(1, { stiffness: 0.3, damping: 0.4 });
	const scaleB = spring(1, { stiffness: 0.3, damping: 0.4 });
	const scaleDrawer = spring(1, { stiffness: 0.3, damping: 0.4 });

	// Pressure sensitivity state
	let pressIntervalA = null;
	let pressIntervalB = null;
	let pressSpeedA = 100; // Initial speed (ms)
	let pressSpeedB = 100;
	let accelerationCounterA = 0; // Persistent counter
	let accelerationCounterB = 0; // Persistent counter
	const MIN_SPEED = 20; // Fastest speed (ms)
	const SPEED_DECREASE = 10; // How much to decrease each acceleration step

	// Get current destination
	$: dest = $destinoGlobal;

	// Transfer amount - starts small, increases with pressure
	let transferAmountA = 10000;
	let transferAmountB = 10000;

	const LIMITE_INFERIOR_NULO = 241515;

	function transferVotes(amount) {
		if (!selectedPartyId) return;

		const dest = $destinoGlobal;

		// Prevent transferring from PDC to PDC or LIBRE to LIBRE
		if (
			(selectedPartyId === 'PDC' && dest === 'A') ||
			(selectedPartyId === 'LIB' && dest === 'B')
		) {
			return; // Can't transfer to yourself
		}

		if (selectedPartyId === 'NULO') {
			// Transfer from NULO
			const currentNulo = $nulo?.votos || 0;
			const nuBase = ($nulo?.baseVotos ?? currentNulo) || 0;
			const minNulo = LIMITE_INFERIOR_NULO;

			// Calculate new nulo value
			const newNulo = Math.max(minNulo, Math.min(nuBase, currentNulo - amount));
			const actualDelta = currentNulo - newNulo;

			if (actualDelta !== 0) {
				setNuloVotos(newNulo);
				registrarRedistribucion('NULO', nuBase, -actualDelta);
			}
		} else {
			// Transfer from regular party
			partidos.update(arr => {
				const next = arr.map(p => ({ ...p }));
				const sourceIdx = next.findIndex(p => p.id === selectedPartyId);

				if (sourceIdx === -1) return arr;

				const sourceParty = next[sourceIdx];
				const currentVotes = sourceParty.votos || 0;
				const baseVotes = sourceParty.baseVotos || currentVotes;

				// Calculate new source party votes with constraints
				let newSourceVotes;
				const isFinalist = selectedPartyId === 'PDC' || selectedPartyId === 'LIB';

				if (amount > 0) {
					// Pressing + button: reduce source party votes (transfer TO destination)
					// Finalists can go down to baseVotos, others to 0
					const minVotes = isFinalist ? baseVotes : 0;
					newSourceVotes = Math.max(minVotes, currentVotes - amount);
				} else {
					// Pressing - button: increase source party votes (recover FROM destination)
					const proposedVotes = currentVotes - amount; // amount is negative, so this increases
					// Non-finalists cannot exceed their baseline
					// Finalists can grow above baseline (receiving from the other)
					newSourceVotes = isFinalist ? proposedVotes : Math.min(baseVotes, proposedVotes);
				}

				const actualDelta = currentVotes - newSourceVotes;

				next[sourceIdx].votos = newSourceVotes;

				// Register redistribution
				if (actualDelta !== 0) {
					registrarRedistribucion(selectedPartyId, baseVotes, -actualDelta);
				}

				// Transfer to destination
				if (dest === 'A') {
					const idxA = next.findIndex(p => p.id === FINALISTA_A_ID);
					if (idxA !== -1) next[idxA].votos = Math.max(0, (next[idxA].votos || 0) + actualDelta);
				} else if (dest === 'B') {
					const idxB = next.findIndex(p => p.id === FINALISTA_B_ID);
					if (idxB !== -1) next[idxB].votos = Math.max(0, (next[idxB].votos || 0) + actualDelta);
				} else {
					// Split between both
					const idxA = next.findIndex(p => p.id === FINALISTA_A_ID);
					const idxB = next.findIndex(p => p.id === FINALISTA_B_ID);
					if (idxA !== -1) next[idxA].votos = Math.max(0, (next[idxA].votos || 0) + actualDelta / 2);
					if (idxB !== -1) next[idxB].votos = Math.max(0, (next[idxB].votos || 0) + actualDelta / 2);
				}

				return next;
			});
		}
		recomputeAll();
	}

	// A controls (add votes to A)
	function startPressA() {
		scaleA.set(0.9);
		transferAmountA = 10000;
		pressSpeedA = 100;
		accelerationCounterA = 0; // Reset counter

		// Immediate first transfer
		transferVotes(transferAmountA);

		// Set up interval that accelerates
		pressIntervalA = setInterval(() => {
			transferVotes(transferAmountA);

			// Accelerate every 3 transfers
			accelerationCounterA++;
			if (accelerationCounterA % 3 === 0 && pressSpeedA > MIN_SPEED) {
				pressSpeedA = Math.max(MIN_SPEED, pressSpeedA - SPEED_DECREASE);
				clearInterval(pressIntervalA);
				pressIntervalA = setInterval(() => {
					transferVotes(transferAmountA);
				}, pressSpeedA);
			}
		}, pressSpeedA);
	}

	function stopPressA() {
		scaleA.set(1);
		if (pressIntervalA) {
			clearInterval(pressIntervalA);
			pressIntervalA = null;
		}
		pressSpeedA = 100;
		transferAmountA = 10000;
		accelerationCounterA = 0; // Reset counter
	}

	// B controls (subtract votes from A)
	function startPressB() {
		scaleB.set(0.9);
		transferAmountB = 10000;
		pressSpeedB = 100;
		accelerationCounterB = 0; // Reset counter

		// Immediate first transfer
		transferVotes(-transferAmountB);

		// Set up interval that accelerates
		pressIntervalB = setInterval(() => {
			transferVotes(-transferAmountB);

			// Accelerate every 3 transfers
			accelerationCounterB++;
			if (accelerationCounterB % 3 === 0 && pressSpeedB > MIN_SPEED) {
				pressSpeedB = Math.max(MIN_SPEED, pressSpeedB - SPEED_DECREASE);
				clearInterval(pressIntervalB);
				pressIntervalB = setInterval(() => {
					transferVotes(-transferAmountB);
				}, pressSpeedB);
			}
		}, pressSpeedB);
	}

	function stopPressB() {
		scaleB.set(1);
		if (pressIntervalB) {
			clearInterval(pressIntervalB);
			pressIntervalB = null;
		}
		pressSpeedB = 100;
		transferAmountB = 10000;
		accelerationCounterB = 0; // Reset counter
	}

	// Handle drawer button touch
	function handleDrawerTouch() {
		scaleDrawer.set(0.9);
		setTimeout(() => scaleDrawer.set(1), 200);
		onOpenDrawer();
	}

	// Cleanup on destroy
	import { onDestroy } from 'svelte';
	onDestroy(() => {
		if (pressIntervalA) clearInterval(pressIntervalA);
		if (pressIntervalB) clearInterval(pressIntervalB);
	});
</script>

<!-- Only show on mobile/tablet (hidden on lg and up) -->
<div class="space-y-2 lg:hidden">
	<!-- Dropdowns side by side -->
	<div class="grid grid-cols-2 gap-2">
		<!-- Origin selector dropdown -->
		<div class="relative">
			<button
				on:click={() => showOriginDropdown = !showOriginDropdown}
				class="flex w-full items-center justify-between rounded-xl bg-white px-2.5 py-2 text-xs font-medium text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
			>
				<span class="truncate">Desde: <strong>{selectedParty?.name || 'Sel.'}</strong></span>
				<ChevronDown class="ml-1 h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
			</button>

			{#if showOriginDropdown}
				<div class="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
					{#each transferableParties as party}
						<button
							on:click={() => {
								selectedPartyId = party.id;
								showOriginDropdown = false;
							}}
							class="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-gray-50"
							class:bg-gray-100={selectedPartyId === party.id}
						>
							<span class="font-medium">{party.name}</span>
							<span
								class="h-3 w-3 rounded-full"
								style="background-color: {party.color}"
							></span>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Destination selector dropdown -->
		<div class="relative">
			<button
				on:click={() => showDestDropdown = !showDestDropdown}
				class="flex w-full items-center justify-between rounded-xl bg-white px-2.5 py-2 text-xs font-medium text-gray-800 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50"
			>
				<span class="truncate">Hacia: <strong>{selectedDestination?.name || 'Sel.'}</strong></span>
				<ChevronDown class="ml-1 h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
			</button>

			{#if showDestDropdown}
				<div class="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl bg-white shadow-lg ring-1 ring-gray-200">
					{#each destinationOptions as dest}
						<button
							on:click={() => {
								$destinoGlobal = dest.id;
								showDestDropdown = false;
							}}
							class="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-gray-50"
							class:bg-gray-100={$destinoGlobal === dest.id}
						>
							<span class="font-medium">{dest.name}</span>
							<span
								class="h-3 w-3 rounded-full"
								style="background-color: {dest.color}"
							></span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Controls row -->
	<div class="flex items-center gap-2">
		<!-- Minus button (remove votes) -->
		<button
			on:mousedown={startPressB}
			on:mouseup={stopPressB}
			on:mouseleave={stopPressB}
			on:touchstart|preventDefault={startPressB}
			on:touchend|preventDefault={stopPressB}
			on:touchcancel|preventDefault={stopPressB}
			disabled={isInvalidTransfer}
			class="flex h-14 flex-1 items-center justify-center rounded-xl bg-gradient-to-b ring-1 transition-all duration-150"
			class:from-white={!isInvalidTransfer}
			class:to-gray-50={!isInvalidTransfer}
			class:shadow-md={!isInvalidTransfer}
			class:ring-gray-300={!isInvalidTransfer}
			class:hover:shadow-lg={!isInvalidTransfer}
			class:active:shadow-sm={!isInvalidTransfer}
			class:active:from-gray-50={!isInvalidTransfer}
			class:active:to-gray-100={!isInvalidTransfer}
			class:from-gray-100={isInvalidTransfer}
			class:to-gray-200={isInvalidTransfer}
			class:ring-gray-200={isInvalidTransfer}
			class:opacity-50={isInvalidTransfer}
			class:cursor-not-allowed={isInvalidTransfer}
			style="transform: scale({$scaleB});"
			aria-label="Reducir votos"
		>
			<Minus class="h-6 w-6 {isInvalidTransfer ? 'text-gray-400' : 'text-gray-700'}" />
		</button>

		<!-- Plus button (add votes) -->
		<button
			on:mousedown={startPressA}
			on:mouseup={stopPressA}
			on:mouseleave={stopPressA}
			on:touchstart|preventDefault={startPressA}
			on:touchend|preventDefault={stopPressA}
			on:touchcancel|preventDefault={stopPressA}
			disabled={isInvalidTransfer}
			class="flex h-14 flex-1 items-center justify-center rounded-xl bg-gradient-to-b ring-1 transition-all duration-150"
			class:from-white={!isInvalidTransfer}
			class:to-gray-50={!isInvalidTransfer}
			class:shadow-md={!isInvalidTransfer}
			class:ring-gray-300={!isInvalidTransfer}
			class:hover:shadow-lg={!isInvalidTransfer}
			class:active:shadow-sm={!isInvalidTransfer}
			class:active:from-gray-50={!isInvalidTransfer}
			class:active:to-gray-100={!isInvalidTransfer}
			class:from-gray-100={isInvalidTransfer}
			class:to-gray-200={isInvalidTransfer}
			class:ring-gray-200={isInvalidTransfer}
			class:opacity-50={isInvalidTransfer}
			class:cursor-not-allowed={isInvalidTransfer}
			style="transform: scale({$scaleA});"
			aria-label="Añadir votos"
		>
			<Plus class="h-6 w-6 {isInvalidTransfer ? 'text-gray-400' : 'text-gray-700'}" />
		</button>

		<!-- Drawer button -->
		<button
			on:mousedown={() => scaleDrawer.set(0.9)}
			on:mouseup={() => scaleDrawer.set(1)}
			on:mouseleave={() => scaleDrawer.set(1)}
			on:touchend|preventDefault={handleDrawerTouch}
			on:click={onOpenDrawer}
			class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-b from-white to-gray-50 shadow-md ring-1 ring-gray-300 transition-all duration-150 hover:shadow-lg active:shadow-sm"
			style="transform: scale({$scaleDrawer});"
			aria-label="Ver KPIs"
		>
			<PanelRightOpen class="h-5 w-5 text-gray-700" />
		</button>
	</div>
</div>
