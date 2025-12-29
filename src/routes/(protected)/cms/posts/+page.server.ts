import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ cookies }) => {
	const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));

	// Get and clear flash message
	const flash = cookies.get('flash');
	if (flash) {
		cookies.delete('flash', { path: '/' });
	}

	return {
		posts: allPosts,
		flash
	};
};
