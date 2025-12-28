import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { posts, files } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const DELETE: RequestHandler = async ({ params }) => {
	const postId = parseInt(params.id);

	const postFiles = await db.select().from(files).where(eq(files.postId, postId));

	for (const file of postFiles) {
		const filepath = path.join(process.cwd(), 'static', file.path);
		if (existsSync(filepath)) {
			await unlink(filepath);
		}
	}

	await db.delete(files).where(eq(files.postId, postId));
	await db.delete(posts).where(eq(posts.id, postId));

	return json({ success: true });
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const postId = parseInt(params.id);
	const body = await request.json();

	await db
		.update(posts)
		.set({
			...body,
			updatedAt: new Date()
		})
		.where(eq(posts.id, postId));

	return json({ success: true });
};
