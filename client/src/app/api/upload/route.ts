/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { NextResponse } from 'next/server';

//Choice for using request over next request: https://www.reddit.com/r/nextjs/comments/12i224x/request_vs_nextrequest_vs_nextapirequest_and/
export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const searchParams = new URLSearchParams(url.searchParams);
		const response = await fetch(
			`https://${process.env.PINATA_GATEWAY_URL}/ipfs/${searchParams.get('imageHash')}`,
			{
				method: 'GET',
			}
		);

		if (response.ok) {
			const imageData = await response.blob();
			return new Response(imageData, { status: 200, headers: { 'Content-Type': 'image/jpeg' } });
		}

		return new Response(JSON.stringify({ error: 'Image not found' }), {
			status: 404,
		});
	} catch (err) {
		console.error('Error fetching image:', err);
		return new Response(JSON.stringify({ err }), {
			status: 500,
		});
	}
}

export async function POST(req: Request) {
	try {
		const formData = await req.formData();
		const imageFile = formData.get('file') as unknown as File | null;
		if (!imageFile) {
			return NextResponse.json(null, { status: 400 });
		}

		const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.PINATA_BEARER_TOKEN}`,
			},
			body: formData,
		});
		const data = await res.json();
		return new Response(
			JSON.stringify({
				data,
			}),
			{ status: 200 }
		);
	} catch (err) {
		console.log(err);
		return new Response(
			JSON.stringify({
				err,
			}),
			{ status: 500 }
		);
	}
}
