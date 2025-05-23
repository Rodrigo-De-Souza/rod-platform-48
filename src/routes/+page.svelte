<script lang="ts">
	import '../style.css';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { StationData, Artifact } from '$lib/types/spacestation';
	import Skeleton from '$lib/components/Skeleton.svelte';

	let loading = $state(true);
	let fetchCount = $state<number>(0);
	let showFlash = $state<boolean>(false);
	let dataResponse = $state<StationData[]>([]);
	let artifacts = $state<Artifact[]>([]);

	async function fetchData() {
		try {
			const res = await fetch('/api/spacestation');
			if (!res.ok) throw new Error('Failed to fetch data');

			const data = await res.json();
			dataResponse = data.data;
			artifacts = dataResponse[0].artifacts;
			fetchCount++;
			showFlash = true;
			loading = false;

			setTimeout(() => {
				showFlash = false;
			}, 2000);
		} catch (err: any) {
			console.log(err.message);
		}
	}

	onMount(() => {
		fetchData();
	});

	onMount(() => {
		fetchData();
		const interval = setInterval(fetchData, 6000); // 60 seconds
		return () => clearInterval(interval);
	});

	fetchCount++;

	let selectedArtifact = $state('');
	let selectedHistoric = $state('true');
	let selectedStation = $state('');

	function submitForm() {
		const params = new URLSearchParams();

		if (selectedArtifact) params.set('artifact', selectedArtifact);
		if (selectedHistoric) params.set('historic', selectedHistoric);
		if (selectedStation) params.set('station', selectedStation);

		goto(`/search?${params.toString()}`);
	}
</script>

{#if loading}
	<div class="container mx-auto px-4 py-12">
		<div class="d-flex rounded-2xl bg-white p-6 shadow-lg">
			<Skeleton />
		</div>
	</div>
{:else}
	<div class="container mx-auto px-4 py-12">
		<div class="rounded-2xl bg-white p-6 shadow-lg">
			<h1 class="mb-4 text-2xl font-bold">Welcome, please select from the dropdown:</h1>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					submitForm();
				}}
				class="flex flex-col justify-center gap-4 p-4"
			>
				<div class="dropdown flex">
					<select class="select mx-4" name="artifact" id="artifact" bind:value={selectedArtifact}>
						<option value="" selected>All Artifacts</option>
						{#if artifacts && artifacts.length > 0}
							{#each artifacts as artifact}
								<option value={artifact.name}>{artifact.name}</option>
							{/each}
						{:else}
							<option value="none">No items found</option>
						{/if}
					</select>

					<select class="select mx-4" name="station" id="station" bind:value={selectedStation}>
						<option value="" selected>All Station</option>
						{#if dataResponse && dataResponse.length > 0}
							{#each dataResponse as station}
								<option value={station.name}>{station.name}</option>
							{/each}
						{:else}
							<option value="none">No items found</option>
						{/if}
					</select>
					<button type="submit" class="btn w-64 rounded-full">Search</button>
				</div>
			</form>

			<div class="flex justify-center p-4">
				<div class="border-base-300 grid">
					<div class="tabs tabs-lift mb-5">
						<label class="tab sqs-button-element--primary">
							<input type="radio" name="my_tabs_4" checked={true} />
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="me-2 size-4"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
								/></svg
							>
							Live
						</label>
						<div class="tab-content bg-base-100 border-base-300 p-6">
							<h2 class="p-4 font-bold">Price Updated every 60 seconds</h2>
							<div class="flex justify-center">
								<div class="rounded-box border-base-content/5 bg-base-100 overflow-x-auto border">
									<table class="table">
										<!-- head -->
										<thead>
											<tr>
												<th>Space Station</th>
												{#if artifacts && artifacts.length > 0}
													{#each artifacts as artifact}
														<th>{artifact.name}</th>
													{/each}
												{:else}
													<th>No items found</th>
												{/if}
												<th>Date</th>
											</tr>
										</thead>
										<tbody>
											{#if dataResponse && dataResponse.length > 0}
												{#each dataResponse as station}
													<tr>
														<th>{station.name}</th>
														{#each station.artifacts as artifact}
															<td class={`font-bold ${showFlash ? 'flash-green-text-effect' : ''}`}
																>{artifact.price}</td
															>
														{/each}
														<td>Today</td>
													</tr>
												{/each}
											{:else}
												<tr>
													<td>No items found</td>
												</tr>
											{/if}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
