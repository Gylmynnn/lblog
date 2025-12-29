<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Calendar, ArrowLeft, Download, FileIcon, User } from '@lucide/svelte';

	let { data } = $props();
	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(new Date(date));
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<svelte:head>
	<title>{data.post.title} - Laziza Blog</title>
	<meta name="description" content={data.post.excerpt || data.post.title} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Header />

	<main class="flex-1">
		<article class="py-12">
			<div class="mx-auto max-w-3xl px-6">
				<Button variant="ghost" href="/" class="mb-8 -ml-2">
					<ArrowLeft class="h-4 w-4" />
					Kembali
				</Button>

				<header class="mb-8">
					<div class="mb-6 flex items-center gap-4">
						{#if data.author}
							<div
								class="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/70 text-sm font-bold text-primary-foreground"
							>
								{getInitials(data.author.name)}
							</div>
							<div>
								<p class="font-medium text-foreground">{data.author.name}</p>
								<div class="flex items-center gap-2 text-sm text-muted-foreground">
									<Calendar class="h-3.5 w-3.5" />
									<time datetime={data.post.createdAt.toString()}>
										{formatDate(data.post.createdAt)}
									</time>
								</div>
							</div>
						{:else}
							<div class="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
								<User class="h-5 w-5 text-muted-foreground" />
							</div>
							<div>
								<p class="font-medium text-foreground">Anonim</p>
								<div class="flex items-center gap-2 text-sm text-muted-foreground">
									<Calendar class="h-3.5 w-3.5" />
									<time datetime={data.post.createdAt.toString()}>
										{formatDate(data.post.createdAt)}
									</time>
								</div>
							</div>
						{/if}
					</div>

					<h1 class="mb-4 text-3xl font-bold text-foreground md:text-4xl">
						{data.post.title}
					</h1>
					{#if data.post.excerpt}
						<p class="text-lg text-muted-foreground">
							{data.post.excerpt}
						</p>
					{/if}
				</header>

				{#if data.post.coverImage}
					<div class="mb-8 aspect-video overflow-hidden rounded-xl bg-muted">
						<img src={data.post.coverImage} alt={data.post.title} class="h-full w-full object-cover" />
					</div>
				{/if}

				<div class="prose">
					{@html data.post.content}
				</div>

				{#if data.files.length > 0}
					<div class="mt-12 border-t border-border pt-8">
						<h2 class="mb-4 text-lg font-semibold">File Lampiran</h2>
						<div class="grid gap-3">
							{#each data.files as file}
								<a
									href={file.path}
									download={file.originalName}
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
								>
									<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<FileIcon class="h-5 w-5 text-primary" />
									</div>
									<div class="min-w-0 flex-1">
										<p class="truncate font-medium text-foreground">{file.originalName}</p>
										<p class="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
									</div>
									<Download class="h-5 w-5 text-muted-foreground" />
								</a>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</article>
	</main>

	<Footer />
</div>
