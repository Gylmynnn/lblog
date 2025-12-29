<script lang="ts">
	import type { Post } from '$lib/server/db/schema';
	import { Calendar, ArrowRight, FileText, User } from '@lucide/svelte';

	interface Author {
		id: number;
		name: string;
		username: string;
	}

	interface Props {
		post: Post & { author?: Author | null };
	}

	let { post }: Props = $props();

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(new Date(date));
	}
</script>

<article class="group h-full">
	<a
		href="/blog/{post.slug}"
		class="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
	>
		<div class="relative overflow-hidden">
			{#if post.coverImage}
				<div class="aspect-4/3 overflow-hidden bg-muted">
					<img
						src={post.coverImage}
						alt={post.title}
						class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
					/>
				</div>
			{:else}
				<div class="flex aspect-4/3 items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
					<FileText class="h-12 w-12 text-primary/30" />
				</div>
			{/if}
			<div
				class="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			></div>
		</div>

		<div class="flex flex-1 flex-col p-4">
			<div class="mb-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
				{#if post.author}
					<User class="h-3 w-3 shrink-0" />
					<span class="truncate">{post.author.name}</span>
					<span class="shrink-0">·</span>
				{/if}
				<Calendar class="h-3 w-3 shrink-0" />
				<span class="shrink-0">{formatDate(post.createdAt)}</span>
			</div>

			<h2
				class="mb-2 line-clamp-2 text-base leading-snug font-bold text-foreground transition-colors duration-200 group-hover:text-primary"
			>
				{post.title}
			</h2>

			{#if post.excerpt}
				<p class="mb-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
					{post.excerpt}
				</p>
			{/if}

			<div class="mt-auto flex items-center justify-between pt-3">
				<span class="text-sm font-semibold text-primary">Baca artikel</span>
				<ArrowRight class="h-4 w-4 text-primary transition-transform duration-300 group-hover:translate-x-1" />
			</div>
		</div>
	</a>
</article>
