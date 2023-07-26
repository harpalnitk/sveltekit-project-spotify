<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import {Button} from '$components';
</script>

<!-- on:submit  will run if js is enabled  -->

<!-- otherwise if js is disabled action will do the work of calling API -->
<form
	method="POST"
	action="/api/auth/logout"
	
	
	on:submit|preventDefault={async () => {
		const response = await fetch('/api/auth/logout', {
			method: 'POST',
			headers: {
				accept: 'application/json'
			}
		});
		if (response.ok) {
			// this will run all load functions including
			// the root layout load function
			// and thus page will be refreshed and logout button will
			//disappear
			invalidateAll();
		}
	}}
>
	<Button element='button' type="submit">Logout</Button>
</form>