import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';

// data is from the load function of layout.server.ts file
export const load = (async ({ data, url }) => {

	// since data can be undefined and we cannot destructure undefined
	//adding for safety empty object
	// we need to return the fata from server file in page 
	// File also so that it is available in svelte file 
	const { user, userAllPlaylists } = data || {};
	
	// if logged in and accessing login page redirect to home
	if (user && url.pathname === '/login') {
		throw redirect(307, '/');
	}

	//if not logged in and accessing any page other than login
	//redirect to login page
	if (!user && url.pathname !== '/login') {
		throw redirect(307, '/login');
	}

	return {
		user,
		userAllPlaylists
	};
}) satisfies LayoutLoad;
