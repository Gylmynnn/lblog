import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { posts, users } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const publishedPosts = await db
		.select({
			post: posts,
			author: {
				id: users.id,
				name: users.name,
				username: users.username
			}
		})
		.from(posts)
		.leftJoin(users, eq(posts.authorId, users.id))
		.where(eq(posts.published, true))
		.orderBy(desc(posts.createdAt));

	return {
		posts: publishedPosts.map((p) => ({
			...p.post,
			author: p.author
		}))
	};
};
