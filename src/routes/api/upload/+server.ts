import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { processAndUploadImage, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '$lib/server/supabase';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
	const formData : FormData = await request.formData();
	const file = formData.get('image') as File;
	if (!file || file.size === 0) return json({ error: 'No file provided' }, { status: 400 });
	if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return json({ error: 'Tipe file tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP.' }, { status: 400 });
	if (file.size > MAX_FILE_SIZE) return json({ error: 'Ukuran file maksimal 2MB.' }, { status: 400 });
	const result = await processAndUploadImage(file, 'editor');
	if ('error' in result) return json({ error: result.error }, { status: 500 });
	return json({ url: result.url });
};
