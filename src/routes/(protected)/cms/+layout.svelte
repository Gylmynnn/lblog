<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { toggleMode, mode } from 'mode-watcher';
	import { LayoutDashboard, FileText, House, LogOut, User, Sun, Moon } from '@lucide/svelte';

	let { children, data } = $props();

	const menuItems = [
		{ href: '/cms', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/cms/posts', label: 'Posts', icon: FileText }
	];
</script>

<div class="min-h-screen bg-background">
	<aside class="fixed top-0 left-0 flex h-screen w-72 flex-col border-r border-border bg-card">
		<div class="flex items-start justify-between p-6">
			<a href="/cms" class="text-md font-bold text-primary">Content Manajement System</a>
			<button
				onclick={toggleMode}
				class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				title={mode.current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
			>
				{#if mode.current === 'dark'}
					<Sun class="h-6 w-6" />
				{:else}
					<Moon class="h-6 w-6" />
				{/if}
			</button>
		</div>
		<nav class="flex-1 px-3">
			{#each menuItems as item}
				<a
					href={item.href}
					class="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
						{page.url.pathname === item.href
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
				>
					<item.icon class="h-4 w-4" />
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="space-y-1 border-t border-border p-3">
			{#if data.user}
				<div class="flex items-center gap-3 px-3 py-2.5">
					<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
						<User class="h-4 w-4 text-primary" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-foreground">{data.user.name}</p>
						<p class="truncate text-xs text-muted-foreground">@{data.user.username}</p>
					</div>
				</div>
			{/if}

			<a
				href="/"
				class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
			>
				<House class="h-4 w-4" />
				Lihat Blog
			</a>

			<form action="/logout" method="POST" use:enhance>
				<button
					type="submit"
					class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
				>
					<LogOut class="h-4 w-4" />
					Logout
				</button>
			</form>
		</div>
	</aside>

	<main class="ml-72 min-h-screen">
		<div class="p-8">
			{@render children()}
		</div>
	</main>
</div>
