<!-- src/routes/Footer.svelte -->

<!-- 
  Footer component that displays copyright information.
  Features:
  - Fixed positioning at bottom of page
  - Semi-transparent background
  - Responsive padding for different screen sizes
  - Centered content alignment
-->

<script lang="ts">
</script>

<!-- Main footer container with copyright notice -->
<footer>
    <!-- Copyright text with current year -->
    <p>&copy; 2024 Deborah Sobiella. All rights reserved.</p>
</footer>

<style>
    /* 
     * Main footer styling
     * Uses flexbox for alignment and fixed positioning to stay at bottom
     */
    footer {
        /* Flexbox for horizontal centering */
        display: flex;
        
        /* Fixed positioning at bottom of viewport */
        bottom: 0;
        position: fixed;
        
        /* Background color */
        background-color: rgba(218, 160, 78, 0.8);
        
        /* Center-align text content */
        text-align: center;
        
        /* Base padding for mobile */
        padding: 0px 10px;
        
        /* Ensure footer spans full width */
        width: 100%;
    }

    /* 
     * Responsive padding adjustment for larger screens
     * Increases vertical padding when viewport width >= 480px
     */
    @media (min-width: 480px) {
        footer {
            padding: 12px 0;
        }
    }
</style>