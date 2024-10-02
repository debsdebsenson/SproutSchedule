<!-- Home.svelte -->

<script>
    import { navigate } from "svelte-routing";

    function goToSecondPage() {
        navigate("/second");
    }

    import FileUpload from '../components/FileUpload.svelte';
</script>

<h1>Welcome to the Home Page</h1>
<button on:click={goToSecondPage}>Go to Second Page</button>

<FileUpload />

<style>
    button {
		width: 240px;
    }
</style>