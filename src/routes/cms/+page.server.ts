import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { posts } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));

	const totalPosts = allPosts.length;
	const publishedPosts = allPosts.filter((p) => p.published).length;
	const draftPosts = totalPosts - publishedPosts;

	return {
		stats: {
			totalPosts,
			publishedPosts,
			draftPosts
		},
		recentPosts: allPosts.slice(0, 5)
	};
};
