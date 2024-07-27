import { invariantResponse } from '@epic-web/invariant'
import {
	json,
	type LinksFunction,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { useNavigate, useLoaderData } from '@remix-run/react'
import { ClientOnly } from 'remix-utils/client-only'
import { Icon } from '#app/components/ui/icon.js'
import Viewer from '../../components/viewer.client'
import { getArtworkUrl } from '../resources+/search-data.server'
import zoomStyles from './artworks.zoom.$artworkId.css?url'

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

//! https://developer.mozilla.org/en-US/docs/Web/API/Document/exitFullscreen ⚪️

export default function Zoom() {
	const navigate = useNavigate()
	const { identifier } = useLoaderData() as { identifier: string }
	const { colorHsl } = useLoaderData() as { colorHsl: string }
	return (
		<>
			<button
				className="btn-back absolute bottom-4 left-8 z-10 h-9 w-9 rounded-full bg-black/75"
				style={{
					color: colorHsl,
				}}
				onClick={() => {
					navigate(-1)
					console.log('button-back clicked')
				}}
			>
				<Icon
					name="arrow-left"
					className="h-6 w-6 brightness-150 saturate-200"
					style={
						{
							/* color: colorHsl */
						}
					}
				/>
			</button>
			<ClientOnly fallback={<div>Loading...</div>}>
				{() => (
					<Viewer
						src={identifier}
						isTiledImage={true}
						options={{
							openSeadragon: {
								gestureSettingsMouse: {
									scrollToZoom: true,
								},

									showNavigator: true,
							},
						}}
					/>
				)}
			</ClientOnly>
		</>
	)
}
