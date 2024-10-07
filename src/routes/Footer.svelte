<!-- src/routes/Footer.svelte -->

<script>
</script>

<footer>
    <p>&copy; 2024 Deborah Sobiella. All rights reserved.</p>
</footer>

<style>
    footer
    {
        display: flex;
        bottom: 0;
        background-color: rgba(218, 160, 78, 0.8);;
        text-align: center;
        padding: 0px 10px;
        width: 100%;
        position: fixed;
    }

    @media (min-width: 480px) {
        footer {
            padding: 12px 0;
        }
    }
</style>
