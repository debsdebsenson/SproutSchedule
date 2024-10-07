<!-- src/routes/+error.svelte -->

<script>
// @ts-nocheck

	import { page } from '$app/stores';
</script>

<h1>{$page.status}: {$page.error.message}</h1>