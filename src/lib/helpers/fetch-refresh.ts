// during client side navigation the 
// access token can expire so we create a helper for fetch will
// check if fetch returns 401 error; if there is error in fetch we 
// will use refresh token to get new access token

import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';

export default async function fetchRefresh(
	fetch: (input: URL | RequestInfo, init?: RequestInit | undefined) => Promise<Response>,
	path: string
) {
	const req = fetch(path);
    // if we are in the server we don't need to do anything and return the request
    // as it is; on server this problem will not happen because our token
    //will already be refreshed in the layout
    // we need to do error checking only in the client
    // when user is browsing
	if (!browser) return req;
	const res = await req;
	if (res.status === 401) {

// await fetch('/api/auth/refresh');
// return fetch(path);

// the above ( 2 lines) is what we need but it will refresh access
//token for all fetch requests and only one will be successfull
//because for others the access token will already be refreshed
// and as such other requests will fail


// refresh token only if there is no reresh token request
//already in progress

//window.refreshPromise type definition needs to be declared in app.d.ts
		if (!window.refreshPromise) {

            // storing the promise in a global place ; window object
			window.refreshPromise = fetch('/api/auth/refresh').finally(() => {
				// clear the globally stored value when 
                //fetch promise is resolved
                window.refreshPromise = null;
			});
		}
		const refreshRes = await window.refreshPromise;
		if (!refreshRes.ok) throw error(401, 'Session Expired!');
		return fetch(path);
	} else {
        // if no 401 error return response
		return res;
	}
}