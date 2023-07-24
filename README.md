>npm create svelte@latest sveltekit-project-spotify
select skeleton project
select typescript
eslint
prettier
>npm install

## Normalize general css properties like padding etc
>npm i modern-normalize
then in root layout import
import 'modern-normalize/modern-normalize.css';

### Instal Sass
>npm i -D sass

>npm i -D svelte-preprocess

for pre-processing data in svelet.config.js
used instead of vite-preprocess

## package to help in media queries
> npm i @unsass/breakpoint


## Global styles
in src/styles folder create main.css file
and import it in the root layout

### font
>npm i @fontsource/metropolis


# Create application on spotify
Go to developer.spotify.com

> npm i @types/spotify-api
type definitions of all spotify code

## icon package
> npm i lucide-svelte

## Using typescript to extend native html attributes

## tippy.js for dropdowns using actions
 $actions alias in svelte.config.js file
 >npm i tippy.js

### creating custom theme for tippy

https://atomiks.github.io/tippyjs/v6/themes/

### we are also using tippy plugins for
1. when we are on last menu item and click tab; tippy menu should close
2. if we are on menu items and we click escape; tippy menu should close
3. if one meu is opened clicking on another menu should close first one


## Skiplink
if user does not want to tab through all links of menu and direcctly want to go to links of main page..functionality implemented in layout.svelte file

## Loading indicator library
 >npm i nprogress 

 ### Site changes for JS disabled
 in navigation.svelte always display sidebar menu
 make changes in layout.svelte to make sidebar and main content in
 column direction and also make changes to top bar

 also fixe user menu button in header.svelt

 ## code of home page in +page.server.ts file

 import type { PageServerLoad } from './$types';
import { SPOTIFY_BASE_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
	//access token is http only cookie and will be
	//accessible only on server and not on client
	const accessToken = cookies.get('access_token');

	const res = await fetch(`${SPOTIFY_BASE_URL}/browse/new-releases`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	console.log(await res.json());
};


moved to +page.ts file and an API
