<script lang="ts">
	import PageTransition from '$lib/components/PageTransition.svelte';
	let { children } = $props();
</script>

<PageTransition>
	{@render children()}
</PageTransition>
