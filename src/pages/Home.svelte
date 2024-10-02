<!-- Home.svelte -->

<script>
    import { navigate } from "svelte-routing";

    function goToSecondPage() {
        navigate("/second");
    }
</script>

<h1>Welcome to the Home Page</h1>
<button on:click={goToSecondPage}>Go to Second Page</button>

<style>
    button {
		width: 240px;
    }
</style>
