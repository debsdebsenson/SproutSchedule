<!-- src/routes/Header.svelte -->

<!--
  Header component that provides navigation for the application
  Features:
  - Includes a logo and login/user icon
  - Navigation links with active state indication
  - Responsive styling with flexbox layout
  - Semi-transparent background
-->

<script lang="ts">
    import { page } from '$app/stores';
    import logo from '$lib/images/logo.svg';
    import login from '$lib/images/placeholder.svg';
</script>

<!-- 
  Main header element that contains the logo, navigation, and login/user icon
  Uses flexboxes to align the three main sections
-->
<header>
    <!-- Left corner section with the logo -->
    <div class="corner">
            <img src={logo} alt="SproutSchedule" />
    </div>

    <!-- Central navigation section -->
    <nav>
        <!-- Spacer SVG elements for visual styling -->
        <svg viewBox="0 0 2 3" aria-hidden="true"></svg>
        <ul>
            <!-- Navigation links with active state indication -->
            <li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
                <a href="/">Home</a>
            </li>
            <li aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>
                <a href="/about">About</a>
            </li>
            <li aria-current={$page.url.pathname.startsWith('/third') ? 'page' : undefined}>
                <a href="/third">Third Page</a>
            </li>
        </ul>
        <svg viewBox="0 0 2 3" aria-hidden="true"></svg>
    </nav>

    <!-- Right corner section with the login/user icon -->
    <div class="corner">
        <!-- TBD: Replace placeholder link and image for the login/user icon -->
        <a href="https://github.com/sveltejs/kit">
            <img src={login} alt="login" />
        </a>
    </div>
</header>

<style>
    /*
     * Styles for the logo/icon corner sections
     * - Fixed width and height
     * - Flex container for centering the content
     */
    .corner {
        width: 3em;
        height: 3em;
    }

    .corner a {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
    }

    .corner img {
        width: 2em;
        height: 2em;
        object-fit: contain;
    }

    /*
     * Styles for the navigation section
     * - Flex container for centering the navigation links
     * - Semi-transparent background
     * - Spacer SVG elements for visual separation
     */
    nav {
        display: flex;
        justify-content: center;
        --background: rgba(255, 255, 255, 0.7);
    }

    nav svg {
        width: 2em;
        height: 3em;
        display: block;
    }

    nav ul {
        position: relative;
        padding: 0;
        margin: 0;
        height: 3em;
        display: flex;
        justify-content: center;
        align-items: center;
        list-style: none;
        background: var(--background);
        background-size: contain;
    }

    /*
     * Styles for the individual navigation links
     * - Full height of the navigation section
     * - Active state indicator with a triangular shape
     * - Hover effect for the link color
     * - Typographic styles for the links
     */
    li {
        position: relative;
        height: 100%;
    }

    li[aria-current='page']::before {
        --size: 6px;
        content: '';
        width: 0;
        height: 0;
        position: absolute;
        top: 0;
        left: calc(50% - var(--size));
        border: var(--size) solid transparent;
        border-top: var(--size) solid var(--color-theme-1);
    }

    nav a {
        display: flex;
        height: 100%;
        align-items: center;
        padding: 0 0.5rem;
        color: var(--color-text);
        font-weight: 700;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        text-decoration: none;
        transition: color 0.2s linear;
    }

    a:hover {
        color: var(--color-theme-1);
    }
</style>