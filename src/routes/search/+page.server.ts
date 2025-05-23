// @ts-nocheck
import { getJWT } from '../../lib/server/jwtcache';
import { redis } from '$lib/server/redis';

function addHistoryDates(data) {
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);

	return data.map((location) => {
		const artifacts = location.artifacts.map((artifact) => {
			const historyWithDates = artifact.history.map((price, index) => {
				const date = new Date(yesterday);
				date.setDate(yesterday.getDate() - index);
				const formattedDate = date.toLocaleDateString('en-GB');
				return {
					date: formattedDate,
					price: price
				};
			});
			return {
				...artifact,
				history: historyWithDates
			};
		});
		return {
			...location,
			artifacts: artifacts
		};
	});
}
export async function load({ url }) {
	const searchQuery = url.search;
	const token = await getJWT();
	const searchQueryParams = new URLSearchParams(searchQuery);
	const historicMode = searchQueryParams.get('historic') === 'true';

	const cached = await redis.get(searchQueryParams.toString());

	if (cached) {
		let data = JSON.parse(cached);
		return { data };
	}

	const response = await fetch(
		`https://api.jellyfaas.com/spacestation-cvm2ffq9io6g00dj7vpg-1-s?${searchQueryParams}`,
		{
			headers: { jfwt: token }
		}
	);
	if (!response.ok) throw new Error('Failed to fetch data from JellyFaaS API');
	let data = await response.json();

	if (historicMode) {
		data = addHistoryDates(data);
	}
	await redis.set(searchQueryParams.toString(), JSON.stringify(data), 'EX', 6000);
	return { data };
}
