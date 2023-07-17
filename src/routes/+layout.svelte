<script lang="ts">
    //sets standard css like padding etc on all pages
    import 'modern-normalize/modern-normalize.css';
    //global styles
    import '../styles/main.scss';

    import type { LayoutData } from './$types';
    import { LogoutButton } from '$components';

export let data: LayoutData;
$: user = data.user;
</script>
{#if user}
	<p>Hello {user.display_name}</p>
	<LogoutButton />
{/if}
<slot/>