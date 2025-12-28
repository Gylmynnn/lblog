import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { verifyToken } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('auth_token');

	if (event.url.pathname.startsWith('/cms')) {
		if (!token) {
			throw redirect(303, '/login');
		}
		const payload = await verifyToken(token);
		if (!payload) {
			event.cookies.delete('auth_token', { path: '/' });
			throw redirect(303, '/login');
		}
		event.locals.user = payload;
	}

	if (event.url.pathname.startsWith('/api/posts') || event.url.pathname.startsWith('/api/upload')) {
		if (!token) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const payload = await verifyToken(token);

		if (!payload) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		event.locals.user = payload;
	}
	return resolve(event);
};
