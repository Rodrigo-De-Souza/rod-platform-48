<script lang="ts">
	import type {
		Artifact,
		StationData,
		History,
		CurrentSelectedPrice
	} from '$lib/types/spacestation';
	import '../../style.css';
	import { goto } from '$app/navigation';

	let { data } = $props();

	const dataResponse: StationData[] = data.data;
	const artifacts: Artifact[] = dataResponse[0].artifacts;
	const dates: History[] = dataResponse[0].artifacts[0].history;
	const filterDates = dates.map((date: History) => {
		return date.date;
	});

	let currentSelectedDate = $state<CurrentSelectedPrice>({});

	function handleChange(stationName: string, dateEvent: string) {
		currentSelectedDate[stationName] = dateEvent;
	}

	function getPriceForSelectedDate(artifact: Artifact, stationName: string) {
		const selectedDate = currentSelectedDate[stationName];
		const historyEntry = artifact.history?.find(
			(artifact: History) => artifact.date === selectedDate
		);
		return historyEntry?.price ?? artifact.price;
	}
</script>

<div class="flex justify-center p-4">
	<div class="border-base-300 grid">
		<div class="rounded-box border-base-content/5 bg-base-100 overflow-x-auto border">
			<button class="btn m-5 bg-green-500 text-white" onclick={() => goto(`/`)}
				>Back to Search</button
			>
			<table class="table">
				<thead>
					<tr>
						<th>Space Station</th>
						<th>Select Date</th>
						{#if artifacts && artifacts.length > 0}
							{#each artifacts as artifact}
								<th>{artifact.name}</th>
							{/each}
						{:else}
							<th>No items found</th>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#if dataResponse && dataResponse.length > 0}
						{#each dataResponse as station}
							<tr>
								<th>{station.name}</th>
								<th>
									<select
										class="select"
										value={currentSelectedDate[station.name] || ''}
										onchange={(e) => handleChange(station.name, e.currentTarget.value)}
									>
										<option value="" selected>Today</option>
										{#each filterDates as date}
											<option value={date}>{date}</option>
										{/each}
									</select>
								</th>
								{#each station.artifacts as artifact}
									{#if artifact.history && artifact.history.length > 0}
										<th>
											{getPriceForSelectedDate(artifact, station.name)}
										</th>
									{:else}
										<td>Today</td>
									{/if}
								{/each}
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
