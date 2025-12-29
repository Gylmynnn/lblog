import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { posts, files } from '$lib/server/db/schema';
import { redirect, fail } from '@sveltejs/kit';
import {
	processAndUploadImage,
	uploadAttachment,
	MAX_FILE_SIZE,
	ALLOWED_IMAGE_TYPES,
	ALLOWED_ATTACHMENT_TYPES
} from '$lib/server/supabase';

function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();
}

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		const formData = await request.formData();

		const title = formData.get('title') as string;
		const content = formData.get('content') as string;
		const excerpt = formData.get('excerpt') as string;
		const published = formData.get('published') === 'on';
		const coverImageFile = formData.get('coverImage') as File;
		const attachments = formData.getAll('attachments') as File[];

		if (!title || !content) {
			return fail(400, { error: 'Title dan content wajib diisi' });
		}

		const slug = generateSlug(title);
		let coverImageUrl: string | null = null;

		if (coverImageFile && coverImageFile.size > 0) {
			if (coverImageFile.size > MAX_FILE_SIZE) return fail(400, { error: 'Ukuran cover image maksimal 2MB' });
			if (!ALLOWED_IMAGE_TYPES.includes(coverImageFile.type)) return fail(400, { error: 'Tipe cover image tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP.' });
			const result = await processAndUploadImage(coverImageFile, 'covers');
			if ('error' in result) return fail(500, { error: result.error });
			coverImageUrl = result.url;
		}

		const newPost = await db
			.insert(posts)
			.values({
				title,
				slug,
				content,
				excerpt: excerpt || null,
				coverImage: coverImageUrl,
				published,
				authorId: locals.user?.userId || null
			})
			.returning();
		const postId = newPost[0].id;
		for (const file of attachments) {
			if (file && file.size > 0) {
				if (file.size > MAX_FILE_SIZE) continue;
				if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type))continue;
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
		cookies.set('flash', 'Post berhasil dibuat!', { path: '/', maxAge: 5 });
		throw redirect(303, '/cms/posts');
	}
};
