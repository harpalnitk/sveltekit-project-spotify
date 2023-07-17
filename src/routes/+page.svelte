<script lang="ts">
  import {Button} from '$components';
</script>

<Button/>
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<input type="text">
<select name="" id="">
    <option value="">Option</option>
</select>
<button>Button</button>



<style lang="scss">
    // @use '../styles/functions';
    //moved above line to svelte.config.js
    //using svelte-preprocess



    // @use '@unsass/breakpoint';
    //above is a package to help write media queries
    //also moved from here to svelte config file in
    //prepend data
    h1{
        color: red;
        font-size: functions.toRem(36);
        @include breakpoint.up('md'){
            color:green;
        }
    }
</style>