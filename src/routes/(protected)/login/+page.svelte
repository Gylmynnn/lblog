<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import { LogIn } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let { form } = $props();
	let isLoading = $state(false);

	$effect(() => {
		if (form?.error) {
			toast.error('Login gagal', {
				description: form.error
			});
		}
	});
</script>

<svelte:head>
	<title>Login - Laziza CMS</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-background px-4">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-3xl font-bold text-primary">Laziza CMS</h1>
			<p class="text-muted-foreground">Masuk untuk mengelola blog</p>
		</div>

		<div class="rounded-xl border border-border bg-card p-8 shadow-sm">
			{#if form?.error}
				<div class="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
					{form.error}
				</div>
			{/if}

			<form
				method="POST"
				use:enhance={() => {
					isLoading = true;
					return async ({ update }) => {
						await update();
						isLoading = false;
					};
				}}
				class="space-y-5"
			>
				<div>
					<label for="username" class="mb-2 block text-sm font-medium text-foreground">
						Username
					</label>
					<input
						type="text"
						id="username"
						name="username"
						required
						autocomplete="username"
						class="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
						placeholder="Masukkan username"
					/>
				</div>

				<div>
					<label for="password" class="mb-2 block text-sm font-medium text-foreground">
						Password
					</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						autocomplete="current-password"
						class="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
						placeholder="Masukkan password"
					/>
				</div>

				<Button type="submit" class="w-full" disabled={isLoading}>
					{#if isLoading}
						<span class="mr-2 animate-spin">...</span>
						Memproses...
					{:else}
						<LogIn class="h-4 w-4" />
						Masuk
					{/if}
				</Button>
			</form>
		</div>

		<p class="mt-6 text-center text-sm text-muted-foreground">
			<a href="/" class="text-primary hover:underline">Kembali ke Blog</a>
		</p>
	</div>
</div>
