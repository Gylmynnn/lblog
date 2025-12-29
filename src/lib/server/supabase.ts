import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import sharp from 'sharp';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
    if (_supabase) return _supabase;

    const supabaseUrl = env.SUPABASE_URL;
    const supabaseServiceKey = env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) throw new Error('Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');

    _supabase = createClient(supabaseUrl, supabaseServiceKey);
    return _supabase;
}

export const BUCKET_NAME: string = 'uploads';
export const MAX_FILE_SIZE: number = 2 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES: Array<string> = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_ATTACHMENT_TYPES: Array<string> = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/wps-office.docx',
    'application/wps-office.doc',
    'application/wps-office.xlsx',
    'application/wps-office.xls',
    'application/wps-office.pptx',
    'application/wps-office.ppt',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation',
    'text/plain',
    'text/csv',
    'application/rtf',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
];

export async function compressImage(
    buffer: Buffer,
    options: { quality?: number; maxWidth?: number } = {}
): Promise<Buffer> {
    const { quality = 80, maxWidth = 1920 } = options;

    return sharp(buffer)
        .resize(maxWidth, null, {
            withoutEnlargement: true,
            fit: 'inside'
        })
        .webp({ quality })
        .toBuffer();
}

export async function uploadToSupabase(
    file: Buffer,
    filename: string,
    contentType: string,
    folder: string = 'images'
): Promise<{ url: string; path: string } | { error: string }> {
    const filePath = `${folder}/${filename}`;
    const supabase = getSupabase();

    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
        contentType,
        upsert: false
    });
    if (error) return { error: error.message };
    const {
        data: { publicUrl }
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    return { url: publicUrl, path: data.path };
}

export async function deleteFromSupabase(filePath: string): Promise<boolean> {
    const supabase = getSupabase();
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    if (error) return false;
    return true;
}

export async function processAndUploadImage(
    file: File,
    folder: string = 'images'
): Promise<{ url: string; path: string } | { error: string }> {
    if (file.size > MAX_FILE_SIZE) return { error: `Ukuran file maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB` };
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return { error: 'Tipe file tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP.' };

    try {
        const buffer : Buffer<ArrayBuffer> = Buffer.from(await file.arrayBuffer());
        const compressedBuffer : Buffer<ArrayBufferLike> = await compressImage(buffer);
        const timestamp : number = Date.now();
        const random : string = Math.random().toString(36).substring(7);
        const filename : string = `${timestamp}-${random}.webp`;
        return await uploadToSupabase(compressedBuffer, filename, 'image/webp', folder);
    } catch (error) {
        return { error: 'Gagal memproses gambar' };
    }
}

export async function uploadAttachment(
    file: File,
    folder: string = 'attachments'
): Promise<{ url: string; path: string; filename: string; size: number } | { error: string }> {
    if (file.size > MAX_FILE_SIZE) return { error: `Ukuran file maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB` };
    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) return { error: 'Tipe file tidak didukung.' };

    try {
        const timestamp : number = Date.now();
        const random : string = Math.random().toString(36).substring(7);
        let buffer: Buffer<ArrayBufferLike>;
        let filename: string;
        let contentType: string;
        let finalSize: number;

        if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
            buffer = Buffer.from(await file.arrayBuffer());
            buffer = await compressImage(buffer);
            filename = `${timestamp}-${random}.webp`;
            contentType = 'image/webp';
            finalSize = buffer.length;
        } else {
            buffer = Buffer.from(await file.arrayBuffer());
            const ext : string = file.name.split('.').pop() || 'bin';
            filename = `${timestamp}-${random}.${ext}`;
            contentType = file.type;
            finalSize = file.size;
        }

        const result = await uploadToSupabase(buffer, filename, contentType, folder);
        if ('error' in result) return result;

        return {
            ...result,
            filename,
            size: finalSize
        };
    } catch (error) {
        return { error: 'Gagal mengupload file' };
    }
}
