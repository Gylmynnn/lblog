<script lang="ts">
	import { toggleMode, mode } from 'mode-watcher';
	import { Sun, Moon } from '@lucide/svelte';
</script>

<header class="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
	<div class="mx-auto max-w-5xl px-6 py-4">
		<nav class="flex items-center justify-between">
			<a
				href="/"
				class="text-xl font-semibold text-primary transition-colors hover:text-primary/80"
			>
				Laziza Blog
			</a>
			<div class="flex items-center gap-4">
				<button
					onclick={toggleMode}
					class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					title={mode.current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
				>
					{#if mode.current === 'dark'}
						<Sun class="h-5 w-5" />
					{:else}
						<Moon class="h-5 w-5" />
					{/if}
				</button>
			</div>
		</nav>
	</div>
</header>
