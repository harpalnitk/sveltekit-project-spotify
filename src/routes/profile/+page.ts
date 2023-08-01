import { fetchRefresh } from '$helpers';
import type { PageLoad } from '../$types';

export const load: PageLoad = async ({ fetch, parent }) => {
    // user from parent layout (layout.server.ts) file
	const { user } = await parent();

    // fetch artists which user is following
	const followingReq = fetchRefresh(fetch, `/api/spotify/me/following?type=artist&limit=6`);

	let colorReq;

	if (user?.images && user.images.length > 0) {
		colorReq = fetchRefresh(
			fetch,
			`/api/average-color?${new URLSearchParams({
				image: user.images[0].url
			}).toString()}`
		);
	}

	const [followingRes, colorRes] = await Promise.all([followingReq, colorReq]);

	return {
        // note: we are sending promise in following
		following: followingRes.ok
			? (followingRes.json() as Promise<SpotifyApi.UsersFollowedArtistsResponse>)
			: undefined,
		title: user?.display_name,
		color: colorRes?.ok ? colorRes.json().then((r) => r.color) : null
	};
};