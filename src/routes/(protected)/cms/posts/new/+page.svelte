<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ArrowLeft, Upload, X, ImageIcon } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';

	let { form } = $props();

	let coverImagePreview = $state<string | null>(null);
	let coverImageInput = $state<HTMLInputElement | null>(null);
	let attachmentFiles = $state<File[]>([]);
	let editorContent = $state('');

	$effect(() => {
		if (form?.error) {
			toast.error('Gagal menyimpan', {
				description: form.error
			});
		}
	});

	function handleCoverImage(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				coverImagePreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function handleAttachments(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = Array.from(input.files || []);
		attachmentFiles = [...attachmentFiles, ...files];
		// Reset the input so user can select the same file again if needed
		input.value = '';
	}

	function removeAttachment(index: number) {
		attachmentFiles = attachmentFiles.filter((_, i) => i !== index);
	}

	function removeCoverImage() {
		coverImagePreview = null;
		if (coverImageInput) coverImageInput.value = '';
	}

	function triggerCoverImageUpload() {
		coverImageInput?.click();
	}

	function handleEditorUpdate(html: string) {
		editorContent = html;
	}
</script>

<div>
	<div class="mb-8 flex items-center gap-4">
		<Button variant="ghost" size="icon" href="/cms/posts">
			<ArrowLeft class="h-4 w-4" />
		</Button>
		<div>
			<h1 class="text-2xl font-bold text-foreground">Buat Post Baru</h1>
			<p class="text-muted-foreground">Tulis artikel baru untuk blog kamu</p>
		</div>
	</div>

	{#if form?.error}
		<div class="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
			{form.error}
		</div>
	{/if}

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={({ formData }) => {
			// Add attachment files to form data
			if (attachmentFiles.length > 0) {
				// Remove any existing attachments field
				formData.delete('attachments');
				// Add each file
				attachmentFiles.forEach((file) => {
					formData.append('attachments', file);
				});
			}
			return async ({ update }) => {
				await update();
			};
		}}
		class="space-y-6"
	>
		<input type="hidden" name="content" value={editorContent} />

		<!-- Hidden file input for cover image -->
		<input
			type="file"
			bind:this={coverImageInput}
			name="coverImage"
			accept="image/*"
			class="hidden"
			onchange={handleCoverImage}
		/>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Main Content -->
			<div class="space-y-6 lg:col-span-2">
				<div class="space-y-4 rounded-xl border border-border bg-card p-6">
					<div>
						<label for="title" class="mb-2 block text-sm font-medium text-foreground">
							Judul <span class="text-destructive">*</span>
						</label>
						<input
							type="text"
							id="title"
							name="title"
							required
							class="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
							placeholder="Masukkan judul artikel"
						/>
					</div>

					<div>
						<label for="excerpt" class="mb-2 block text-sm font-medium text-foreground"> Ringkasan </label>
						<textarea
							id="excerpt"
							name="excerpt"
							rows="2"
							class="w-full resize-none rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
							placeholder="Ringkasan singkat artikel (opsional)"
						></textarea>
					</div>

					<div>
						<span class="mb-2 block text-sm font-medium text-foreground">
							Konten <span class="text-destructive">*</span>
						</span>
						<RichTextEditor onUpdate={handleEditorUpdate} />
					</div>
				</div>

				<!-- File Attachments -->
				<div class="rounded-xl border border-border bg-card p-6">
					<h3 class="mb-4 text-sm font-medium text-foreground">File Lampiran</h3>

					<label
						class="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input transition-colors hover:bg-muted/50"
					>
						<div class="flex flex-col items-center justify-center pt-5 pb-6">
							<Upload class="mb-2 h-8 w-8 text-muted-foreground" />
							<p class="text-sm text-muted-foreground">Klik untuk upload file</p>
							<p class="mt-1 text-xs text-muted-foreground">Maks 2MB per file (gambar, PDF, DOC, TXT)</p>
						</div>
						<input
							type="file"
							multiple
							class="hidden"
							accept="image/*,.pdf,.doc,.docx,.txt"
							onchange={handleAttachments}
						/>
					</label>

					{#if attachmentFiles.length > 0}
						<div class="mt-4 space-y-2">
							{#each attachmentFiles as file, index}
								<div class="flex items-center justify-between rounded-lg bg-muted p-3">
									<span class="truncate text-sm text-foreground">{file.name}</span>
									<button type="button" onclick={() => removeAttachment(index)} class="rounded p-1 hover:bg-background">
										<X class="h-4 w-4 text-muted-foreground" />
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Publish Settings -->
				<div class="rounded-xl border border-border bg-card p-6">
					<h3 class="mb-4 text-sm font-medium text-foreground">Pengaturan</h3>

					<label class="flex cursor-pointer items-center gap-3">
						<input type="checkbox" name="published" class="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
						<span class="text-sm text-foreground">Publish sekarang</span>
					</label>
				</div>

				<!-- Cover Image -->
				<div class="rounded-xl border border-border bg-card p-6">
					<h3 class="mb-4 text-sm font-medium text-foreground">Cover Image</h3>

					{#if coverImagePreview}
						<div class="relative">
							<img src={coverImagePreview} alt="Cover preview" class="aspect-video w-full rounded-lg object-cover" />
							<button
								type="button"
								onclick={removeCoverImage}
								class="absolute top-2 right-2 rounded-full bg-background/80 p-1 hover:bg-background"
							>
								<X class="h-4 w-4" />
							</button>
						</div>
					{:else}
						<button
							type="button"
							onclick={triggerCoverImageUpload}
							class="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input transition-colors hover:bg-muted/50"
						>
							<ImageIcon class="mb-2 h-8 w-8 text-muted-foreground" />
							<p class="text-sm text-muted-foreground">Upload gambar</p>
						</button>
					{/if}
				</div>

				<!-- Actions -->
				<div class="flex gap-3">
					<Button type="submit" class="flex-1">Simpan</Button>
					<Button type="button" variant="outline" href="/cms/posts">Batal</Button>
				</div>
			</div>
		</div>
	</form>
</div>
