import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { posts, files, users } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const result = await db
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
		.where(and(eq(posts.slug, params.slug), eq(posts.published, true)))
		.limit(1);

	if (result.length === 0) throw error(404, 'Post tidak ditemukan');
	const postFiles = await db.select().from(files).where(eq(files.postId, result[0].post.id));
	return {
		post: result[0].post,
		author: result[0].author,
		files: postFiles
	};
};
