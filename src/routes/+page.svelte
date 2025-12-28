<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import PostCard from '$lib/components/PostCard.svelte';
	import { FileText, Calendar, ArrowRight, Sparkles, User } from '@lucide/svelte';

	let { data } = $props();

	const featuredPost = $derived(data.posts[0]);
	const remainingPosts = $derived(data.posts.slice(1));

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(new Date(date));
	}
</script>

<svelte:head>
	<title>Laziza Blog - Minimalis & Aesthetic</title>
	<meta name="description" content="Blog minimalis dengan konten berkualitas" />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Header />

	<main class="flex-1">
		<!-- Hero Section -->
		<section class="relative overflow-hidden py-12 sm:py-16 md:py-28">
			<div class="absolute inset-0 -z-10 bg-linear-to-b from-primary/5 to-transparent"></div>
			<div class="mx-auto max-w-5xl px-4 text-center sm:px-6">
				<div
					class="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary sm:mb-6 sm:px-4 sm:py-2 sm:text-sm"
				>
					<Sparkles class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
					Blog Personal
				</div>
				<h1 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:mb-6 sm:text-4xl md:text-6xl">
					Laziza <span class="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">Blog</span>
				</h1>
				<p class="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
					Tempat berbagi cerita, ide, dan inspirasi. Ditulis dengan cinta untuk kamu yang suka membaca.
				</p>
			</div>
		</section>

		{#if data.posts.length > 0}
			<!-- Featured Post Section -->
			{#if featuredPost}
				<section class="pb-8 sm:pb-12">
					<div class="mx-auto max-w-5xl px-4 sm:px-6">
						<div class="mb-6 flex items-center gap-3 sm:mb-8">
							<div class="h-px flex-1 bg-border"></div>
							<h2 class="text-sm font-semibold tracking-widest text-muted-foreground uppercase">Artikel Terbaru</h2>
							<div class="h-px flex-1 bg-border"></div>
						</div>
						<a href="/blog/{featuredPost.slug}" class="group block">
							<article
								class="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
							>
								<div class="flex flex-col md:grid md:grid-cols-2">
									<!-- Image -->
									<div class="relative overflow-hidden">
										{#if featuredPost.coverImage}
											<div class="aspect-[4/3] overflow-hidden bg-muted md:aspect-auto md:h-full md:min-h-[380px]">
												<img
													src={featuredPost.coverImage}
													alt={featuredPost.title}
													class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
												/>
											</div>
										{:else}
											<div
												class="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 md:aspect-auto md:h-full md:min-h-[380px]"
											>
												<FileText class="h-16 w-16 text-primary/30" />
											</div>
										{/if}
										<!-- Overlay gradient -->
										<div
											class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
										></div>
										<!-- Featured badge -->
										<div class="absolute top-4 left-4">
											<span
												class="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg"
											>
												Terbaru
											</span>
										</div>
									</div>

									<!-- Content -->
									<div class="flex flex-col justify-center p-6 sm:p-8 md:p-10">
										<!-- Meta -->
										<div class="mb-4 flex flex-wrap items-center gap-3">
											{#if featuredPost.author}
												<div class="flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1.5 text-sm">
													<User class="h-4 w-4 text-muted-foreground" />
													<span class="font-medium text-foreground">{featuredPost.author.name}</span>
												</div>
											{/if}
											<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
												<Calendar class="h-4 w-4" />
												<time datetime={featuredPost.createdAt.toString()}>{formatDate(featuredPost.createdAt)}</time>
											</div>
										</div>

										<!-- Title -->
										<h3
											class="mb-4 text-2xl leading-tight font-bold text-foreground transition-colors duration-200 group-hover:text-primary sm:text-3xl md:text-4xl"
										>
											{featuredPost.title}
										</h3>

										<!-- Excerpt -->
										{#if featuredPost.excerpt}
											<p class="mb-6 line-clamp-3 text-base leading-relaxed text-muted-foreground">
												{featuredPost.excerpt}
											</p>
										{/if}

										<!-- CTA -->
										<div class="flex items-center gap-4">
											<span class="text-base font-semibold text-primary">Baca artikel</span>
											<div
												class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover:bg-primary"
											>
												<ArrowRight
													class="h-5 w-5 text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white"
												/>
											</div>
										</div>
									</div>
								</div>
							</article>
						</a>
					</div>
				</section>
			{/if}

			<!-- More Posts Section -->
			{#if remainingPosts.length > 0}
				<section class="pb-12 sm:pb-20">
					<div class="mx-auto max-w-5xl px-4 sm:px-6">
						<div class="mb-6 flex items-center gap-3 sm:mb-8">
							<div class="h-px flex-1 bg-border"></div>
							<h2 class="text-sm font-semibold tracking-widest text-muted-foreground uppercase">Artikel Lainnya</h2>
							<div class="h-px flex-1 bg-border"></div>
						</div>
						<div class="grid gap-4 sm:gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
							{#each remainingPosts as post}
								<PostCard {post} />
							{/each}
						</div>
					</div>
				</section>
			{/if}
		{:else}
			<!-- Empty State -->
			<section class="pb-12 sm:pb-20">
				<div class="mx-auto max-w-5xl px-4 sm:px-6">
					<div class="rounded-2xl border border-dashed border-border bg-muted/20 py-20 text-center">
						<div class="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
							<FileText class="h-10 w-10 text-primary" />
						</div>
						<h2 class="mb-3 text-2xl font-semibold text-foreground">Belum ada artikel</h2>
						<p class="text-muted-foreground">Artikel pertama akan segera hadir. Tunggu ya!</p>
					</div>
				</div>
			</section>
		{/if}
	</main>

	<Footer />
</div>
