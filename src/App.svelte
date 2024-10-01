<!-- App.svelte -->

<script>
    import { Router, Route } from "svelte-routing";
    import Menu from "./components/Menu.svelte";
    import Footer from './components/Footer.svelte';
    import Home from "./pages/Home.svelte";
    import SecondPage from "./pages/SecondPage.svelte";
    import ThirdPage from "./pages/ThirdPage.svelte";

    export let url = "";
	
</script>

<Router {url}>
    <div class="container">
        <header>
            <img src="/images/logo.png" alt="Logo" class="logo" />
            <Menu />
        </header>
        <main>
            <Route path="/" component={Home} />
            <Route path="/second" component={SecondPage} />
            <Route path="/third" component={ThirdPage} />
        </main>
        <Footer />
    </div>
</Router>

<style>
</style>
