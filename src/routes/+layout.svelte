<!-- src/routes/+layout.svelte -->

<script>
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import '../app.css';
	import { browser } from '$app/environment';

	// Register service worker
	if (browser) {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/service-worker.js')
			.then((registration) => {
				console.log('Service worker registered:', registration);
			})
			.catch((error) => {
				console.error('Service worker registration failed:', error);
			});
		}
	}
</script>

<div class="app">
	<Header />

	<main>
		<slot />
	</main>

	<Footer />
</div>

<style>
	/* Main */
	main {
		padding: 20px;
		max-width: 800px;
		margin: 20px auto;
		background-color: rgba(251, 242, 210, 0.6);
		border-radius: 10px;
	}
</style>
