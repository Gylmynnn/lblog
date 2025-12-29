<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { FileText, Eye, FilePen, Plus } from '@lucide/svelte';
	let { data } = $props();
</script>

<div>
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Dashboard</h1>
			<p class="text-muted-foreground">Selamat datang {data.user !== undefined ? data.user.name : 'Laziza'}</p>
		</div>
		<Button href="/cms/posts/new">
			<Plus class="h-4 w-4" />
			Buat Post Baru
		</Button>
	</div>

	<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
		<div class="rounded-xl border border-border bg-card p-6">
			<div class="flex items-center gap-4">
				<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
					<FileText class="h-6 w-6 text-primary" />
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Total Posts</p>
					<p class="text-2xl font-bold text-foreground">{data.stats.totalPosts}</p>
				</div>
			</div>
		</div>
		<div class="rounded-xl border border-border bg-card p-6">
			<div class="flex items-center gap-4">
				<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
					<Eye class="h-6 w-6 text-green-600" />
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Published</p>
					<p class="text-2xl font-bold text-foreground">{data.stats.publishedPosts}</p>
				</div>
			</div>
		</div>
		<div class="rounded-xl border border-border bg-card p-6">
			<div class="flex items-center gap-4">
				<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
					<FilePen class="h-6 w-6 text-amber-600" />
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Draft</p>
					<p class="text-2xl font-bold text-foreground">{data.stats.draftPosts}</p>
				</div>
			</div>
		</div>
	</div>

	<div class="rounded-xl border border-border bg-card">
		<div class="border-b border-border p-6">
			<h2 class="text-lg font-semibold text-foreground">Post Terbaru</h2>
		</div>
		{#if data.recentPosts.length > 0}
			<div class="divide-y divide-border">
				{#each data.recentPosts as post}
					<a
						href="/cms/posts/{post.id}"
						class="flex items-center justify-between p-4 transition-colors hover:bg-accent"
					>
						<div class="min-w-0 flex-1">
							<h3 class="truncate font-medium text-foreground">{post.title}</h3>
							<p class="text-sm text-muted-foreground">
								{new Date(post.createdAt).toLocaleDateString('id-ID', {
									year: 'numeric',
									month: 'short',
									day: 'numeric'
								})}
							</p>
						</div>
						<span
							class="rounded-full px-2.5 py-1 text-xs font-medium {post.published
								? 'bg-green-500/10 text-green-600'
								: 'bg-amber-500/10 text-amber-600'}"
						>
							{post.published ? 'Published' : 'Draft'}
						</span>
					</a>
				{/each}
			</div>
		{:else}
			<div class="p-8 text-center">
				<p class="text-muted-foreground">Belum ada post. Mulai buat post pertama kamu!</p>
			</div>
		{/if}
	</div>
</div>
