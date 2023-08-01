// In TrackList.svelte
// if we put our action in playlist/[id]/page.Server.ts then problem is
// 	that our action is dynamic based on the playlist selected by the user
// 	from the dropdown. If js is disabled then that action will not
// 	work. therefore we will put our action directly inside playlist only
	
// 	action ="/playlist/{playlistId}?/addItem" 

import { SPOTIFY_BASE_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';



//action for adding song to a playlist
export const actions: Actions = {
	addItem: async ({ request, cookies, url, fetch }) => {
		const data = await request.formData();
		const track = data.get('track');
		const playlist = data.get('playlist');

//         redirect={$page.url.pathname} added because path playlist has not .svelte 
// page to render so we need to pass the path of the page 
// which needs to be rendered when action is complete
		const redirectTo = url.searchParams.get('redirect');

		const res = await fetch(`${SPOTIFY_BASE_URL}/playlists/${playlist}/tracks`, {
			method: 'POST',
			body: JSON.stringify({
				uris: [`spotify:track:${track}`]
			}),
			headers: {
				Authorization: `Bearer ${cookies.get('access_token')}`
			}
		});

		if (!res.ok) {
			throw redirect(
				303,
				redirectTo
					? `${redirectTo}?error=${res.statusText}`
					: `/playlist/${playlist}?error=${res.statusText}` // playlist page in which we are adding track
			);
		}

		if (redirectTo) {
			throw redirect(303, `${redirectTo}?success=Track added successfully!`);
		} else {
			throw redirect(303, `/playlist/${playlist}?success=Track added successfully!`);
		}
	}
};