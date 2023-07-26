import { json } from '@sveltejs/kit';
import sharp from 'sharp';
import type { RequestHandler } from './$types';

// URL used to access this end point will be like below:-

// http://localhost:5173/api/average-color?image=https://images.cdn.com/yutygbvnm
export const GET: RequestHandler = async ({ url, fetch }) => {
	const imageURL = url.searchParams.get('image');
	if (imageURL) {
		//download image and pass it to array buffer
		const image = await fetch(imageURL).then((res) => res.arrayBuffer());
		// pass image as buffer to sharp and call function .stats of sharp
		const stats = await sharp(Buffer.from(image)).stats();
		// get the average color from the channels
		// the map will return an array
		const [r, g, b] = stats.channels.map((c) => c.mean);
		return json({ color: `rgba(${r},${g},${b})` });
	}
	return json({ color: null });
};