<script lang="ts">
	import { Button } from '$components';
	import PlaylistForm from '$components/PlaylistForm.svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<h2>Add a New Playlist</h2>

<PlaylistForm userID={data.user?.id} {form}/>


