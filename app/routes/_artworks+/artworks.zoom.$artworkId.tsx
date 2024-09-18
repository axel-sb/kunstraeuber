import { invariantResponse } from '@epic-web/invariant'
import {
	json,
	type LinksFunction,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { useNavigate, useLoaderData } from '@remix-run/react'
import { ClientOnly } from 'remix-utils/client-only'
// import { Icon } from '#app/components/ui/icon.js'
import { Icon } from '#app/components/ui/icon.js'
import Viewer from '../../components/viewer.client'
import { getArtworkUrl } from '../resources+/search-data.server'
import zoomStyles from './artworks.zoom.artworkId.css?url'

export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: zoomStyles }]
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
	invariantResponse(params.artworkId, 'Missing artworkId param')
	const data = await getArtworkUrl({ id: Number(params.artworkId) })
	console.log('🟡 data →', data)

	// return a default picture if no image_url is found or if the image_url is nullish.
	const src = data
		? data.image_url ??
			'https://www.artic.edu/iiif/2/f8fd76e9-c396-5678-36ed-6a348c904d27/full/843,/0/default.jpg'
		: 'https://www.artic.edu/iiif/2/f8fd76e9-c396-5678-36ed-6a348c904d27/full/843,/0/default.jpg'

	console.log('🟢 src →', src, typeof src)

	const identifier = src.split('/full/')[0]
	console.log('🔴 identifier →', identifier)
	/* typeof identifier === 'string'
		? identifier
		: 'https://www.artic.edu/iiif/2/f8fd76e9-c396-5678-36ed-6a348c904d27' */

	const colorHsl = data ? data.colorHsl ?? data.colorHsl : 'hsl(0 0% 100%)'

	return json({ identifier, colorHsl })
}

export default function Zoom() {
	const navigate = useNavigate()
	const { identifier } = useLoaderData() as { identifier: string }
	const { colorHsl } = useLoaderData() as { colorHsl: string }
	const colorStyle = { '--color': colorHsl } as React.CSSProperties
	return (
		<>
			<div className="absolute bottom-6 left-8 z-10 inline-flex h-9 w-9 rounded-full bg-white/70 text-black backdrop-brightness-200 backdrop-saturate-200">
				<Icon
					name="x"
					className="h-9 w-9"
					style={{
						backgroundColor: '#0000',
						borderRadius: '50%',
						backgroundImage: `radial-gradient(#0000, #0000 38%, ${colorStyle} 75% 100%)`,
					}}
					onClick={() => navigate(-1)}
				/>
			</div>
			<ClientOnly fallback={<div>Loading...</div>}>
				{() => <Viewer src={identifier} isTiledImage={true} />}
			</ClientOnly>
		</>
	)
}
