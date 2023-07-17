import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SPOTIFY_APP_CLIENT_ID, SPOTIFY_APP_CLIENT_SECRET, BASE_URL } from '$env/static/private';

export const GET: RequestHandler = async ({url, cookies, fetch}) => {
	//console.log(event);

	const code = url.searchParams.get('code') || null;

	// for security reasonswe need to make sure that the state
	// that we get back as response
	//from spotify matches the state that we had sent in the login request
// the one that we sent in login will be stored in a cookie
	const state = url.searchParams.get('state') || null;

	const storedState = cookies.get('spotify_auth_state') || null;
	const storedChallengeVerifier = cookies.get('spotify_auth_chllenge_verifier') || null;

	if(state === null || state !== storedState){
           throw error(400, 'State Mismatch!');
	}

	// using code send a post request to get access token and refresh token
const response = await fetch(`https://accounts.spotify.com/api/token`,{
	method:'POST',
	headers:{
		'Content-Type':'application/x-www-form-urlencoded',
		Authorization: `Basic ${Buffer.from(
			`${SPOTIFY_APP_CLIENT_ID}:${SPOTIFY_APP_CLIENT_SECRET}`
		).toString('base64')}`
	},
	body: new URLSearchParams({
		code: code || '',
		redirect_uri: `${BASE_URL}/api/auth/callback`,
		grant_type: 'authorization_code',
		code_verifier: storedChallengeVerifier || '', // searchParams must be strings; can't be null
		client_id: SPOTIFY_APP_CLIENT_ID
	})
});


const responseJSON = await response.json();

	if (responseJSON.error) {
		throw error(400, responseJSON.error_description);
	}
	
	cookies.delete('spotify_auth_state');
	cookies.delete('spotify_auth_challenge_verifier');
	cookies.set('refresh_token', responseJSON.refresh_token, { path: '/' });
	//access token expires in 1 hour
	cookies.set('access_token', responseJSON.access_token, { path: '/' });

	throw redirect(303, '/');
};
