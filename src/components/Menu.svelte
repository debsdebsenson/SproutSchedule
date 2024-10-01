<!-- Menu.svelte -->

<script>
    import { Link } from "svelte-routing";
</script>

<nav>
    <Link to="/">
        <button>Home</button>
    </Link>
    <Link to="/second">
        <button>Second Page</button>
    </Link>
    <Link to="/third">
        <button>Third Page</button>
    </Link>
</nav>

<style>
</style>
