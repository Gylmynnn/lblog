<script lang="ts">
	import { page } from '$app/state';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

{#key page.url.pathname}
	<div
		in:fly={{ y: 20, duration: 300, delay: 150, easing: cubicOut }}
		out:fade={{ duration: 150 }}
		class="page-transition"
	>
		{@render children()}
	</div>
{/key}

<style>
	.page-transition {
		min-height: 100vh;
	}
</style>
