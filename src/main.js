// main.js

import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		// pass props here
	}
});

// service worker registration
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
	  navigator.serviceWorker.register('/service-worker.js')
		.then(registration => {
		  console.log('ServiceWorker registered successfully:', registration.scope);
		})
		.catch(error => {
		  console.log('ServiceWorker registration failed:', error);
		});
	});
  }

export default app;