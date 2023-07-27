import { fetchRefresh } from '$helpers';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch: _fetch, params, depends, route,url,parent }) => {
	//for retry button on error page
	depends(`app:${route.id}`);

	//parnet data from root layout or any hierrachy of parent layouts
	// need user to check if he is following a playlist or not
	const {user} = await parent();

	const fetch = (path: string) => fetchRefresh(_fetch, path);

	const limit = 100;
	const page = url.searchParams.get('page');

	// const playlistRes = await fetch(`/api/spotify/playlists/${params.id}`);
	
	// now we need to send an extra request to
	//check user follow status so using Promise.all
	const [playlistRes, isFollowingRes] = await Promise.all([
		fetch(`/api/spotify/playlists/${params.id}`),
		fetch(
			`/api/spotify/playlists/${params.id}/followers/contains?${new URLSearchParams({
				ids: user ? user.id : ''// we can pass multiple ids in comma separated string
			}).toString()}`
		)
		
	]);

	if (!playlistRes.ok) {
		throw error(playlistRes.status, 'Failed to load playlist!');
	}

	let isFollowing: boolean | null = null;

	if (isFollowingRes.ok) {
		const isFollowingJSON: SpotifyApi.UsersFollowPlaylistResponse = await isFollowingRes.json();
		isFollowing = isFollowingJSON[0];
	}

	const playlistResJSON: SpotifyApi.SinglePlaylistResponse = await playlistRes.json();


	// this part of code is needed only for pagination
	//when js is disabled
	//instead of load more button we shall have next and prev button
	if (page && page !== '1') {
		const tracksRes = await fetch(
			`/api/spotify/playlists/${params.id}/tracks?${new URLSearchParams({
				limit: `${limit}`,
				offset: `${limit * (Number(page) - 1)}`
			}).toString()}`
		);
		if (!tracksRes.ok) {
			throw error(tracksRes.status, 'Failed to load playlist!');
		}
		const tracksResJSON = await tracksRes.json();
		playlistResJSON.tracks = tracksResJSON;
	}



	// to get the average color of album cover using npm library
	//sharp so that we can set the page gradient based
	//on the average album cover
	let color = null;
	if (playlistResJSON.images.length > 0) {
		const colorRes = await fetch(
			`/api/average-color?${new URLSearchParams({
				image: playlistResJSON.images[0].url
			}).toString()}`
		);

		if (colorRes.ok) {
			color = (await colorRes.json()).color;
		}
	}

	return {
		playlist: playlistResJSON,
		color,
		title: playlistResJSON.name,
		isFollowing
	};
};
