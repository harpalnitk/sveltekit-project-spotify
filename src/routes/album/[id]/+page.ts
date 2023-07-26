import { fetchRefresh } from '$helpers';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, depends, route }) => {
	
	// if invalidate is called fro page.svelte with this identifier
	//than this load function will run again
	depends(`app:${route.id}`)
	const albumRes = await fetchRefresh(fetch, `/api/spotify/albums/${params.id}`);

	if (!albumRes.ok) {
		throw error(albumRes.status, 'Failed to load album!');
	}

	const albumJSON: SpotifyApi.SingleAlbumResponse = await albumRes.json();

// get average color from the album cover using api endpoint
	let color = null;
	if (albumJSON.images.length > 0) {
		const colorRes = await fetch(
			`/api/average-color?${new URLSearchParams({
				image: albumJSON.images[0].url
			}).toString()}`
		);
		// http://localhost:5173/api/average-color?image=https://images.cdn.com/yutygbvnm
		
		// convert urlSearchParams to string
		if (colorRes.ok) {
			color = (await colorRes.json()).color;
		}
	}
	return {
		album: albumJSON,
		title: albumJSON.name, // used in toor layout file
		color // also update Page Data definition in app.d.ts
	};
};