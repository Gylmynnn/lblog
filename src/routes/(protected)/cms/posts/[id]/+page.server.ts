import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { posts, files } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, redirect, fail } from '@sveltejs/kit';
import {
	processAndUploadImage,
	uploadAttachment,
	deleteFromSupabase,
	MAX_FILE_SIZE,
	ALLOWED_IMAGE_TYPES,
	ALLOWED_ATTACHMENT_TYPES
} from '$lib/server/supabase';

export const load: PageServerLoad = async ({ params }) => {
	const postId : number = parseInt(params.id);
	const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
	if (post.length === 0) throw error(404, 'Post tidak ditemukan');
	const postFiles = await db.select().from(files).where(eq(files.postId, postId));
	return {
		post: post[0],
		files: postFiles
	};
};

function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();
}

export const actions: Actions = {
	update: async ({ request, params, cookies }) => {
		const postId = parseInt(params.id);
		const formData = await request.formData();

		const title = formData.get('title') as string;
		const content = formData.get('content') as string;
		const excerpt = formData.get('excerpt') as string;
		const published = formData.get('published') === 'on';
		const coverImageFile = formData.get('coverImage') as File;
		const attachments = formData.getAll('attachments') as File[];
		if (!title || !content) return fail(400, { error: 'Title dan content wajib diisi' });

		const slug : string = generateSlug(title);
		let coverImageUrl: string | undefined;
		if (coverImageFile && coverImageFile.size > 0) {
			if (coverImageFile.size > MAX_FILE_SIZE) return fail(400, { error: 'Ukuran cover image maksimal 2MB' });
			if (!ALLOWED_IMAGE_TYPES.includes(coverImageFile.type)) return fail(400, { error: 'Tipe cover image tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP.' });
			const result = await processAndUploadImage(coverImageFile, 'covers');
			if ('error' in result) return fail(500, { error: result.error });
			coverImageUrl = result.url;
		}
		await db
			.update(posts)
			.set({
				title,
				slug,
				content,
				excerpt: excerpt || null,
				...(coverImageUrl && { coverImage: coverImageUrl }),
				published,
				updatedAt: new Date()
			})
			.where(eq(posts.id, postId));
		for (const file of attachments) {
			if (file && file.size > 0) {
				if (file.size > MAX_FILE_SIZE) continue;
				if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) continue; 
				const result = await uploadAttachment(file, 'attachments');
				if ('error' in result) continue;
				await db.insert(files).values({
					filename: result.filename,
					originalName: file.name,
					mimeType: file.type.startsWith('image/') ? 'image/webp' : file.type,
					size: result.size,
					path: result.url,
					postId
				});
			}
		}
		cookies.set('flash', 'Post berhasil diperbarui!', { path: '/', maxAge: 5 });
		throw redirect(303, '/cms/posts');
	},

	deleteFile: async ({ request }) => {
		const formData = await request.formData();
		const fileId = parseInt(formData.get('fileId') as string);
		const file = await db.select().from(files).where(eq(files.id, fileId)).limit(1);
		if (file.length > 0) {
			const storagePath = `attachments/${file[0].filename}`;
			await deleteFromSupabase(storagePath);
			await db.delete(files).where(eq(files.id, fileId));
		}
		return { success: true };
	}
};
