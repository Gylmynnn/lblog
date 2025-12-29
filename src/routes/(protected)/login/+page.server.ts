import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { verifyPassword, createToken } from '$lib/server/auth';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('auth_token');
	if (token) throw redirect(303, '/cms');
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;

		if (!username || !password) return fail(400, { error: 'Username dan password wajib diisi' });
		const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
		if (user.length === 0) return fail(401, { error: 'Username atau password salah' });
		const isValidPassword : boolean = await verifyPassword(password, user[0].password);
		if (!isValidPassword) return fail(401, { error: 'Username atau password salah' });
		const token : string = await createToken({
			userId: user[0].id,
			username: user[0].username,
			name: user[0].name
		});

		cookies.set('auth_token', token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 7
		});
		throw redirect(303, '/cms');
	}
};
