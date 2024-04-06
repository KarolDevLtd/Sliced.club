/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	// const { data, error } = await fetch(process.env.BASE_URL + '/route1' + searchParams)
	return new Response(
		JSON.stringify({
			// data: data ? data : [],
			// error: error ?? ""
		}),
		{ status: 200 }
	);
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
