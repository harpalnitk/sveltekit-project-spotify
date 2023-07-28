import { fetchRefresh } from '$helpers';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	// in edit we need to first load the playlist 
	//so that it can be edited
	const playlistRes = await fetchRefresh(
		// in spotify we can choose in serachParams
		// which fields we need
		fetch,
		`/api/spotify/playlists/${params.id}?${new URLSearchParams({
			fields: 'id,name,description'
		}).toString()}`
	);

	if (!playlistRes.ok) {
		throw error(playlistRes.status, 'Failed to load playlist!');
	}

	const playlistJSON: SpotifyApi.SinglePlaylistResponse = await playlistRes.json();

	return {
		playlist: playlistJSON,
		title: `Edit ${playlistJSON.name}`
	};
};
