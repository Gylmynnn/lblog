<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ConfirmDialog from '$lib/components/ConfirmDialog.svelte';
	import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';

	let { data } = $props();

	// Delete dialog state
	let deleteDialogOpen = $state(false);
	let postToDelete = $state<{ id: number; title: string } | null>(null);
	let isDeleting = $state(false);

	onMount(() => {
		// Show flash message toast if exists
		if (data.flash) {
			toast.success(data.flash);
		}
	});

	function openDeleteDialog(id: number, title: string) {
		postToDelete = { id, title };
		deleteDialogOpen = true;
	}

	function closeDeleteDialog() {
		deleteDialogOpen = false;
		postToDelete = null;
	}

	async function confirmDelete() {
		if (!postToDelete) return;

		isDeleting = true;
		try {
			const response = await fetch(`/api/posts/${postToDelete.id}`, { method: 'DELETE' });
			if (response.ok) {
				toast.success('Post berhasil dihapus');
				closeDeleteDialog();
				window.location.reload();
			} else {
				throw new Error('Gagal menghapus post');
			}
		} catch (error) {
			toast.error('Gagal menghapus post', {
				description: error instanceof Error ? error.message : 'Terjadi kesalahan'
			});
		} finally {
			isDeleting = false;
		}
	}

	async function togglePublish(id: number, currentStatus: boolean) {
		try {
			const response = await fetch(`/api/posts/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ published: !currentStatus })
			});
			if (response.ok) {
				toast.success(currentStatus ? 'Post berhasil di-unpublish' : 'Post berhasil dipublish');
				window.location.reload();
			} else {
				throw new Error('Gagal mengubah status post');
			}
		} catch (error) {
			toast.error('Gagal mengubah status', {
				description: error instanceof Error ? error.message : 'Terjadi kesalahan'
			});
		}
	}
</script>

<!-- Delete Confirmation Dialog -->
<ConfirmDialog
	bind:open={deleteDialogOpen}
	title="Hapus Post"
	description="Apakah kamu yakin ingin menghapus post &quot;{postToDelete?.title}&quot;? Tindakan ini tidak dapat dibatalkan."
	confirmText="Ya, hapus"
	cancelText="Batal"
	variant="danger"
	loading={isDeleting}
	onConfirm={confirmDelete}
	onCancel={closeDeleteDialog}
/>

<div>
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Posts</h1>
			<p class="text-muted-foreground">Kelola semua artikel blog kamu</p>
		</div>
		<Button href="/cms/posts/new">
			<Plus class="h-4 w-4" />
			Buat Post Baru
		</Button>
	</div>

	<div class="overflow-hidden rounded-xl border border-border bg-card">
		{#if data.posts.length > 0}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-muted/50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
								>Judul</th
							>
							<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
								>Status</th
							>
							<th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase"
								>Tanggal</th
							>
							<th class="px-6 py-3 text-right text-xs font-medium tracking-wider text-muted-foreground uppercase"
								>Aksi</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each data.posts as post}
							<tr class="transition-colors hover:bg-muted/30">
								<td class="px-6 py-4">
									<div class="flex items-center gap-3">
										{#if post.coverImage}
											<img src={post.coverImage} alt="" class="h-12 w-12 rounded-lg object-cover" />
										{:else}
											<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
												<span class="text-xs text-muted-foreground">No img</span>
											</div>
										{/if}
										<div class="min-w-0">
											<p class="truncate font-medium text-foreground">{post.title}</p>
											<p class="truncate text-sm text-muted-foreground">/{post.slug}</p>
										</div>
									</div>
								</td>
								<td class="px-6 py-4">
									<span
										class="rounded-full px-2.5 py-1 text-xs font-medium {post.published
											? 'bg-green-500/10 text-green-600'
											: 'bg-amber-500/10 text-amber-600'}"
									>
										{post.published ? 'Published' : 'Draft'}
									</span>
								</td>
								<td class="px-6 py-4 text-sm text-muted-foreground">
									{new Date(post.createdAt).toLocaleDateString('id-ID', {
										year: 'numeric',
										month: 'short',
										day: 'numeric'
									})}
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center justify-end gap-2">
										{#if post.published}
											<Button variant="ghost" size="icon-sm" href="/blog/{post.slug}" target="_blank">
												<ExternalLink class="h-4 w-4" />
											</Button>
										{/if}
										<Button variant="ghost" size="icon-sm" onclick={() => togglePublish(post.id, post.published)}>
											{#if post.published}
												<EyeOff class="h-4 w-4" />
											{:else}
												<Eye class="h-4 w-4" />
											{/if}
										</Button>
										<Button variant="ghost" size="icon-sm" href="/cms/posts/{post.id}">
											<Pencil class="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon-sm"
											onclick={() => openDeleteDialog(post.id, post.title)}
											class="text-destructive hover:text-destructive"
										>
											<Trash2 class="h-4 w-4" />
										</Button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="p-12 text-center">
				<p class="mb-4 text-muted-foreground">Belum ada post. Mulai buat post pertama kamu!</p>
				<Button href="/cms/posts/new">
					<Plus class="h-4 w-4" />
					Buat Post Baru
				</Button>
			</div>
		{/if}
	</div>
</div>
