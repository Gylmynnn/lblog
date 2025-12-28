<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { TriangleAlert, X } from '@lucide/svelte';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	interface Props {
		open: boolean;
		title?: string;
		description?: string;
		confirmText?: string;
		cancelText?: string;
		variant?: 'danger' | 'warning' | 'default';
		loading?: boolean;
		onConfirm: () => void;
		onCancel: () => void;
	}

	let {
		open = $bindable(false),
		title = 'Konfirmasi',
		description = 'Apakah kamu yakin ingin melanjutkan?',
		confirmText = 'Ya, lanjutkan',
		cancelText = 'Batal',
		variant = 'danger',
		loading = false,
		onConfirm,
		onCancel
	}: Props = $props();

	function handleBackdropClick() {
		if (!loading) {
			onCancel();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && !loading) {
			onCancel();
		}
	}

	function handleDialogClick(e: MouseEvent) {
		e.stopPropagation();
	}

	const variantStyles = {
		danger: {
			icon: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
			button: 'bg-red-600 hover:bg-red-700 text-white'
		},
		warning: {
			icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
			button: 'bg-amber-600 hover:bg-amber-700 text-white'
		},
		default: {
			icon: 'bg-primary/10 text-primary',
			button: 'bg-primary hover:bg-primary/90 text-primary-foreground'
		}
	};
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		transition:fade={{ duration: 150 }}
		onclick={handleBackdropClick}
	>
		<!-- Overlay -->
		<div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

		<!-- Dialog -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<div
			class="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
			transition:scale={{ duration: 200, start: 0.95, easing: cubicOut }}
			onclick={handleDialogClick}
			role="alertdialog"
			aria-modal="true"
			aria-labelledby="dialog-title"
			aria-describedby="dialog-description"
		>
			<!-- Close button -->
			<button
				type="button"
				class="absolute top-4 right-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				onclick={onCancel}
				disabled={loading}
				aria-label="Tutup dialog"
			>
				<X class="h-5 w-5" />
			</button>

			<div class="p-6">
				<!-- Icon -->
				<div class="mb-4 flex justify-center">
					<div class="flex h-14 w-14 items-center justify-center rounded-full {variantStyles[variant].icon}">
						<TriangleAlert class="h-7 w-7" />
					</div>
				</div>

				<!-- Content -->
				<div class="mb-6 text-center">
					<h3 id="dialog-title" class="mb-2 text-lg font-semibold text-foreground">
						{title}
					</h3>
					<p id="dialog-description" class="text-sm text-muted-foreground">
						{description}
					</p>
				</div>

				<!-- Actions -->
				<div class="flex gap-3">
					<Button variant="outline" class="flex-1" onclick={onCancel} disabled={loading}>
						{cancelText}
					</Button>
					<button
						type="button"
						class="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 {variantStyles[
							variant
						].button}"
						onclick={onConfirm}
						disabled={loading}
					>
						{#if loading}
							<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						{/if}
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
