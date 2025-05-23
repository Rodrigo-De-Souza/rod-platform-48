// src/routes/api/spacestation/+server.ts
import { json } from '@sveltejs/kit';
import { getJWT } from '$lib/server/jwtcache';
import { redis } from '$lib/server/redis';

export async function GET() {
	const cached = await redis.get('spaceStationData');
	if (cached) {
		const data = JSON.parse(cached);
		return json({ data });
	}
	const token = await getJWT();
	const response = await fetch('https://api.jellyfaas.com/spacestation-cvm2ffq9io6g00dj7vpg-1-s', {
		headers: {
			jfwt: token
		}
	});

	if (!response.ok) {
		return json({ error: 'Failed to fetch data from JellyFaaS API' }, { status: 500 });
	}

	const data = await response.json();

	await redis.set('spaceStationData', JSON.stringify(data), 'EX', 600);
	return json({ data });
}
