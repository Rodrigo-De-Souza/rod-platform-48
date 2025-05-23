import { SECRET_API_KEY } from '$env/static/private';
import { redis } from './redis';

export async function getJWT() {
	const cached = await redis.get('jwtToken');
	if (cached) {
		return JSON.parse(cached);
	}
	const tokenJWT = await fetch('https://api.jellyfaas.com/auth-service/v1/validate', {
		method: 'GET',
		headers: {
			'x-jf-apikey': SECRET_API_KEY
		}
	});

	if (!tokenJWT.ok) {
		throw new Error('Failed to retrive JFWT token');
	}

	const data = await tokenJWT.json();
	const token = data.token;
	const expires = data.expiry;

	const epochSeconds = Date.parse(expires) / 1000;
	const nowMs = Math.floor(new Date().getTime() / 1000);

	const timeToExpire = epochSeconds - nowMs;

	redis.set('jwtToken', JSON.stringify(token), 'EX', timeToExpire);
	return token;
}
