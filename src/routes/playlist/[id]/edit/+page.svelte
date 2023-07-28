<script lang="ts">
	import { PlaylistForm } from '$components';
	import type { ActionData, PageData } from './$types';

	export let form: ActionData;
	export let data: PageData;

	// data loaded in the load function before this page is rendered
	$: playlist = data.playlist;
</script>

<h2>{data.title}</h2>

<PlaylistForm {form} {playlist} action="?redirect" />
