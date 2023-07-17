//server layout file and not client layout file
//because spotify access token cookies are http only cookies
//which can be accessed only on the server

// root layout file will run everytime we open our app or
//refresh our app

import type { LayoutServerLoad } from './$types';
import { SPOTIFY_BASE_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ cookies, fetch, url }) => {
	const accessToken = cookies.get('access_token');
	const refreshToken = cookies.get('refresh_token');
	if (!accessToken) {
		return {
			user: null
		};
	}

	const profileRes = await fetch(`${SPOTIFY_BASE_URL}/me`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});
	if (profileRes.ok) {
		const profile: SpotifyApi.CurrentUsersProfileResponse = await profileRes.json();
		return {
			user: profile
		};
	} 
	// if access token is expired	
	if (profileRes.status === 401 && refreshToken) {
		// refresh the token and try again
		const refreshRes = await fetch('/api/auth/refresh');
		if (refreshRes.ok) {
			// wee need to retry the request we were trying at the begining
			// this will run load function again with new
			//access and refresh tokens
			throw redirect(307, url.pathname);
		}
		return {
			user: null
		};
	} else {
		return {
			user: null
		};
	}
}) satisfies LayoutServerLoad;
