// region imports

import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs, json } from '@remix-run/node'

import { useLoaderData } from '@remix-run/react'
import MeshGradient from 'mesh-gradient.js'
import { useEffect, useMemo } from 'react'

import { getArtwork } from '../resources+/search-data.server.tsx'

// endregion

export const loader = async ({ params }: LoaderFunctionArgs) => {
	invariantResponse(params.artworkId, 'Missing artworkId param')
	const artwork = await getArtwork({ id: Number(params.artworkId) })
	if (!artwork) {
		throw new Response(
			"'getArtwork(id)': This Artwork (ID) was not found on the Server",
			{
				status: 404,
			},
		)
	}


	return json({ artwork })
}

//const COLORS = ['#ffb900', , '#d09000', '#currentColor']

/* const newColors = [ "#ffb900",
  "#eda400",
  "#d09000",
  "#aa7600" ] */

// gradient.changeGradientColors(newColors)

function MeshGradients() {
	const { artwork } = useLoaderData<typeof loader>()

	const colorHsl = artwork.colorHsl
	console.log('colorHsl', colorHsl) // hsl(43 16% 49%)
	const [h, s, l] = (colorHsl?.match(/\d+/g)?.map(Number) ?? []) as number[]
	console.log('[h, s, l', h, s, l) // 43 16 49

	function hslToHex(h: number, s: number, l: number): string {
		l /= 100
		const a = (s * Math.min(l, 1 - l)) / 100
		const f = (n: number): string => {
			const k = (n + h / 30) % 12
			const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
			return Math.round(255 * color)
				.toString(16)
				.padStart(2, '0') // convert to Hex and prefix "0" if needed
		}
		return `#${f(0)}${f(8)}${f(4)}, #${f(0)}${f(8)}${f(4)}80` // #918669, #91866980
	}

  function hslToHexDark(h: number, s: number, l: number): string {
		l /= 100
		const a = (s * Math.min(l, 1 - l)) / 100
		const f = (n: number): string => {
			const k = (n + h / 30) % 12
			const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
			return Math.round(255 * color)
				.toString(16)
				.padStart(2, '0') // convert to Hex and prefix "0" if needed
		}
		return `#${f(0)}${f(8)}${f(4)}, #${f(0)}${f(8)}${f(4)}80` // #918669, #91866980
	}
	// https://www.codemotion.com/magazine/frontend/javascript/the-best-color-manipulation-library-in-javascript/

	console.log('hslToHex', hslToHex(h ?? 0, s ?? 0, l ?? 0))

	const gradient = useMemo(() => new MeshGradient(), [])

	const canvasId = 'my-canvas'

	useEffect(() => {
		const COLORS = ['#4a4a3d', '#3f3f34', '#1d1d18', '#1f1f1a', '#fffed0']
		// initialize new gradient
		// @Params
		// 1. id of canvas element
		// 2. array of colors in hexcode
		gradient.initGradient('#' + canvasId, COLORS)
		// Mesh Id
		// Any positive numeric value which acts as a seed for mesh pattern
		gradient?.changePosition(780)
	}, [gradient, canvasId])

	const regenerate = () => {
		const value = Math.floor(Math.random() * 1000)
		// change pattern by changing mesh Idfocus terminal

		gradient?.changePosition(value)
	}

	return (
		<>
			<img
				className="corner mx-auto max-h-[80dvh] max-w-[clamp(281px,_100%,_calc(100vw-2rem))] object-contain object-center pb-8"
				alt={artwork.alt_text ?? undefined}
				key={artwork.id}
				src={artwork.image_url ?? '../../../four-mona-lisas-sm.jpg'}
				style={{
					boxShadow: `
                0px 0px 0px 0.5px #fff , 0px 0px 1px 1px #fff ,
                2px 4px 2px 0 oklch(from ${colorHsl} 0.25 c h / 1),
                4px 8px 22px 0 oklch(from ${colorHsl} 0.15 c h / 1)`,
					resize: 'both',
				}}
			/>

			<div className="mesh-gradients text-red-500 transition-all">
				<canvas
					id={canvasId}
					width="800"
					height="600"
					style={{
						resize: 'both',
					}}
				/>
				<button onClick={() => regenerate()}> Regenerate </button>
			</div>
		</>
	)
}

export default MeshGradients
