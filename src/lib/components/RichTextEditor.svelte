<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import Image from '@tiptap/extension-image';
	import Placeholder from '@tiptap/extension-placeholder';
	import Underline from '@tiptap/extension-underline';
	import { toast } from 'svelte-sonner';
	import {
		Bold,
		Italic,
		Underline as UnderlineIcon,
		Strikethrough,
		Heading1,
		Heading2,
		Heading3,
		List,
		ListOrdered,
		Quote,
		Code,
		Link as LinkIcon,
		Image as ImageIcon,
		Upload,
		Undo,
		Redo,
		Minus,
		Loader,
		Trash2
	} from '@lucide/svelte';

	interface Props {
		content?: string;
		placeholder?: string;
		onUpdate?: (html: string) => void;
	}

	let { content = '', placeholder = 'Tulis konten artikel di sini...', onUpdate }: Props = $props();

	let element: HTMLDivElement;
	let editor: Editor | null = $state(null);
	let fileInput: HTMLInputElement;
	let isUploading = $state(false);
	let isImageSelected = $state(false);

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2, 3]
					}
				}),
				Underline,
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: 'text-primary underline'
					}
				}),
				Image.configure({
					HTMLAttributes: {
						class: 'rounded-lg max-w-full cursor-pointer'
					}
				}),
				Placeholder.configure({
					placeholder
				})
			],
			content,
			editorProps: {
				attributes: {
					class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3'
				}
			},
			onUpdate: ({ editor }) => {
				onUpdate?.(editor.getHTML());
			},
			onSelectionUpdate: ({ editor }) => {
				// Check if an image is selected
				isImageSelected = editor.isActive('image');
			}
		});
	});

	onDestroy(() => {
		editor?.destroy();
	});

	function setLink() {
		if (!editor) return;
		const previousUrl = editor.getAttributes('link').href;
		const url = window.prompt('URL', previousUrl);

		if (url === null) return;

		if (url === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}

		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	}

	function addImageByUrl() {
		if (!editor) return;
		const url = window.prompt('Image URL');

		if (url) {
			editor.chain().focus().setImage({ src: url }).run();
		}
	}

	function triggerFileUpload() {
		fileInput?.click();
	}

	function deleteSelectedImage() {
		if (!editor || !isImageSelected) return;
		editor.chain().focus().deleteSelection().run();
		isImageSelected = false;
		toast.success('Gambar dihapus dari editor');
	}

	async function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file || !editor) return;

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			toast.error('Format file tidak didukung', {
				description: 'Hanya file JPEG, PNG, GIF, dan WebP yang diizinkan.'
			});
			return;
		}

		// Validate file size (max 2MB)
		if (file.size > 2 * 1024 * 1024) {
			toast.error('File terlalu besar', {
				description: 'Ukuran file maksimal 2MB.'
			});
			return;
		}

		isUploading = true;

		try {
			const formData = new FormData();
			formData.append('image', file);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Upload gagal');
			}

			// Insert image into editor
			editor.chain().focus().setImage({ src: result.url }).run();

			toast.success('Gambar berhasil diupload', {
				description: 'Gambar telah ditambahkan ke artikel.'
			});
		} catch (error) {
			console.error('Upload error:', error);
			toast.error('Gagal mengupload gambar', {
				description: error instanceof Error ? error.message : 'Terjadi kesalahan saat upload.'
			});
		} finally {
			isUploading = false;
			// Reset input
			input.value = '';
		}
	}

	const buttonClass = 'p-2 rounded hover:bg-muted transition-colors disabled:opacity-50';
	const activeClass = 'bg-muted text-primary';
</script>

<div class="overflow-hidden rounded-lg border border-input bg-background">
	<!-- Toolbar -->
	<div class="flex flex-wrap items-center gap-1 border-b border-input bg-muted/30 p-2">
		<!-- Undo/Redo -->
		<button
			type="button"
			onclick={() => editor?.chain().focus().undo().run()}
			disabled={!editor?.can().undo()}
			class={buttonClass}
			title="Undo"
		>
			<Undo class="h-4 w-4" />
		</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().redo().run()}
			disabled={!editor?.can().redo()}
			class={buttonClass}
			title="Redo"
		>
			<Redo class="h-4 w-4" />
		</button>

		<div class="mx-1 h-6 w-px bg-border"></div>

		<!-- Headings -->
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
			class="{buttonClass} {editor?.isActive('heading', { level: 1 }) ? activeClass : ''}"
			title="Heading 1"
		>
			<Heading1 class="h-4 w-4" />
		</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
			class="{buttonClass} {editor?.isActive('heading', { level: 2 }) ? activeClass : ''}"
			title="Heading 2"
		>
			<Heading2 class="h-4 w-4" />
		</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
			class="{buttonClass} {editor?.isActive('heading', { level: 3 }) ? activeClass : ''}"
			title="Heading 3"
		>
			<Heading3 class="h-4 w-4" />
		</button>

		<div class="mx-1 h-6 w-px bg-border"></div>

		<!-- Text Formatting -->
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleBold().run()}
			class="{buttonClass} {editor?.isActive('bold') ? activeClass : ''}"
			title="Bold"
		>
			<Bold class="h-4 w-4" />
		</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleItalic().run()}
			class="{buttonClass} {editor?.isActive('italic') ? activeClass : ''}"
			title="Italic"
		>
			<Italic class="h-4 w-4" />
		</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleUnderline().run()}
			class="{buttonClass} {editor?.isActive('underline') ? activeClass : ''}"
			title="Underline"
		>
			<UnderlineIcon class="h-4 w-4" />
		</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleStrike().run()}
			class="{buttonClass} {editor?.isActive('strike') ? activeClass : ''}"
			title="Strikethrough"
		>
			<Strikethrough class="h-4 w-4" />
		</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleCode().run()}
			class="{buttonClass} {editor?.isActive('code') ? activeClass : ''}"
			title="Inline Code"
		>
			<Code class="h-4 w-4" />
		</button>

		<div class="mx-1 h-6 w-px bg-border"></div>

		<!-- Lists -->
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleBulletList().run()}
			class="{buttonClass} {editor?.isActive('bulletList') ? activeClass : ''}"
			title="Bullet List"
		>
			<List class="h-4 w-4" />
		</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleOrderedList().run()}
			class="{buttonClass} {editor?.isActive('orderedList') ? activeClass : ''}"
			title="Numbered List"
		>
			<ListOrdered class="h-4 w-4" />
		</button>

		<div class="mx-1 h-6 w-px bg-border"></div>

		<!-- Block Elements -->
		<button
			type="button"
			onclick={() => editor?.chain().focus().toggleBlockquote().run()}
			class="{buttonClass} {editor?.isActive('blockquote') ? activeClass : ''}"
			title="Quote"
		>
			<Quote class="h-4 w-4" />
		</button>
		<button
			type="button"
			onclick={() => editor?.chain().focus().setHorizontalRule().run()}
			class={buttonClass}
			title="Horizontal Rule"
		>
			<Minus class="h-4 w-4" />
		</button>

		<div class="mx-1 h-6 w-px bg-border"></div>

		<!-- Link & Image -->
		<button
			type="button"
			onclick={setLink}
			class="{buttonClass} {editor?.isActive('link') ? activeClass : ''}"
			title="Add Link"
		>
			<LinkIcon class="h-4 w-4" />
		</button>
		<button type="button" onclick={addImageByUrl} class={buttonClass} title="Add Image by URL">
			<ImageIcon class="h-4 w-4" />
		</button>
		<button type="button" onclick={triggerFileUpload} class={buttonClass} disabled={isUploading} title="Upload Image">
			{#if isUploading}
				<Loader class="h-4 w-4 animate-spin" />
			{:else}
				<Upload class="h-4 w-4" />
			{/if}
		</button>
		{#if isImageSelected}
			<button
				type="button"
				onclick={deleteSelectedImage}
				class="{buttonClass} text-destructive hover:bg-destructive/10"
				title="Hapus Gambar"
			>
				<Trash2 class="h-4 w-4" />
			</button>
		{/if}
	</div>

	<!-- Hidden file input -->
	<input
		bind:this={fileInput}
		type="file"
		accept="image/jpeg,image/png,image/gif,image/webp"
		onchange={handleFileUpload}
		class="hidden"
	/>

	<!-- Editor Content -->
	<div bind:this={element} class="min-h-75"></div>
</div>

<style>
	:global(.tiptap p.is-editor-empty:first-child::before) {
		color: var(--muted-foreground);
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}

	:global(.tiptap) {
		outline: none;
	}

	:global(.tiptap h1) {
		font-size: 1.875rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	:global(.tiptap h2) {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	:global(.tiptap h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	:global(.tiptap p) {
		margin-bottom: 0.75rem;
	}

	:global(.tiptap ul),
	:global(.tiptap ol) {
		padding-left: 1.5rem;
		margin-bottom: 0.75rem;
	}

	:global(.tiptap ul) {
		list-style-type: disc;
	}

	:global(.tiptap ol) {
		list-style-type: decimal;
	}

	:global(.tiptap blockquote) {
		border-left: 3px solid var(--primary);
		padding-left: 1rem;
		margin: 1rem 0;
		font-style: italic;
		color: var(--muted-foreground);
	}

	:global(.tiptap code) {
		background-color: var(--muted);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.875rem;
	}

	:global(.tiptap pre) {
		background-color: var(--muted);
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin: 1rem 0;
	}

	:global(.tiptap hr) {
		border: none;
		border-top: 1px solid var(--border);
		margin: 1.5rem 0;
	}

	:global(.tiptap img) {
		max-width: 100%;
		border-radius: 0.5rem;
		margin: 1rem 0;
	}
</style>
