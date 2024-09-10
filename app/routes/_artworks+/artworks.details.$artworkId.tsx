// region imports
import { invariantResponse } from '@epic-web/invariant'
import { type Artwork } from '@prisma/client'
import {
	type LinksFunction,
	type LoaderFunctionArgs,
	json,
	redirect,
	type MetaFunction,
	type ActionFunctionArgs,
} from '@remix-run/node'
import {
	Link,
	// NavLink,
	useFetcher,
	useLoaderData,
	useNavigate,
} from '@remix-run/react'
import chalk from 'chalk'
import { type FunctionComponent } from 'react'
import MeshGradients from '#app/components/mesh-gradients.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.js'
import { getArtwork, updateArtwork } from '../resources+/search-data.server.tsx'
import detailsStyles from './artworks.details.artworkId.css?url'

// import { useNonce } from '#app//utils/nonce-provider.ts'
// #endregion imports

export const links: LinksFunction = () => [{ rel: 'stylesheet', href: detailsStyles }]

export const meta: MetaFunction<typeof loader> = () => {
	return [
		{ title: '* Kunsträuber Artwork Page' },
		{
			name: 'Details',
			content: `Details for a single artwork`,
		},
	]
}

export const action = async ({ params }: ActionFunctionArgs) => {
	invariantResponse(params.artworkId, 'Missing artworkId param')

	await updateArtwork(parseInt(params.artworkId))

	return redirect(`./`)
}

//    .................................................    MARK: Loader

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

	// The underscore _ is a convention used by some developers to indicate that the value at that position in the array is not going to be used. This is a way to "ignore" certain returned values when destructuring an array.

	const filteredArtwork: Artwork = Object.fromEntries(
		Object.entries(artwork).filter(
			([_, value]) => value != null && value !== '' && value !== 'none',
		),
	) as Artwork

	console.group(
		chalk.blue.underline.overline('ArtworkId                           🧑🏻‍🎨'),
	)
	console.log(
		chalk.blue.bgWhite(
			Object.entries(filteredArtwork).map(([k, v]) => `${k}: ${v}\n`),
		),
	)
	console.groupEnd()

	return json({ artwork: filteredArtwork })
}

//    ...............................................   MARK: Favorite

const Favorite: FunctionComponent<{
	artwork: Pick<Artwork, 'favorite'>
}> = ({ artwork }) => {
	const fetcher = useFetcher()
	const favorite = fetcher.formData
		? fetcher.formData.get('favorite') === 'true'
		: artwork.favorite

	const {
		artwork: { colorHsl: colorHsl },
	} = useLoaderData<typeof loader>()

	console.log('🔵 fetcher.formData →', fetcher.formData, '🔵')

	return (
		<fetcher.Form method="post" className="favorite">
			<Button
				name="favorite"
				variant="ghost"
				size="ghost"
				className="inline-flex w-8 px-0 pt-2 mt-4"
				style={{
					color: colorHsl as unknown as string,
					filter: 'brightness(1.75)',
					strokeDasharray: 50,
				}}
			>
				{favorite ? (
					<Icon name="star-filling" size="xl" className="animated px-0" />
				) : (
					<Icon name="star" size="xl" className="px-0 opacity-50" />
				)}
			</Button>
		</fetcher.Form>
	)
}

export default function ArtworkDetails() {
	const { artwork } = useLoaderData<typeof loader>()
	const colorHsl = `${artwork.colorHsl}`
  const navigate = useNavigate()
  const halftoneUrl = `url(${artwork.image_url}) 50% / cover` || 'none'

	const artist = {
		__html:
			'<span class="font-medium opacity-60">Artist:  </span> <br>' +
			artwork.artist_display,
	}

	const description = {
		__html:
			artwork.description && artwork.description !== 'null'
				? '<span class="font-medium opacity-60">Description: </span>' +
					artwork.description
				: '',
	}

	return (
		<>
			{/*{' '}
			<header className="flex w-full justify-between p-4">
				<Logo />
				<Favorite artwork={artwork} />
			</header>{' '}
			*/}
			{/* // ......................................  MARK: Halftone               */}
			<aside className="filter opacity-30">
				<div
					className="halftone"
					style={{ '--img': halftoneUrl } as React.CSSProperties}
				></div>
			</aside>
			<img
				src="https://www.artic.edu/iiif/2/9a9737e3-c296-a2b5-4d76-d88f50a61ff8/full/843,/0/default.jpg"
				className="relative -z-10 -translate-y-[105%] opacity-100"
			/>

			<Button
				className="btn-back relative z-10 ml-auto mr-4 flex h-12 w-12 translate-x-1 translate-y-8 cursor-pointer rounded-full text-yellow-50/50 active:opacity-50"
				variant="ghost"
				size="ghost"
				onClick={() => {
					navigate(-1)
				}}
			>
				<Icon
					name="cross-x"
					size="xl"
					className=""
					style={{ color: colorHsl, filter: 'saturate(0.5)' }}
				/>
			</Button>

			{/* // ......................................  MARK: ul               */}

			<ul className="flex h-full flex-col gap-2 px-4 leading-relaxed">
				<li key="title">
					<span className="list-item font-medium opacity-75">
						Title
						{': '}
					</span>
					<span className="detail-content inline-block text-lg">
						{artwork.title}
					</span>
				</li>

				<li
					dangerouslySetInnerHTML={artist}
					className="hyphens-auto pb-4 text-lg"
				></li>

				{Object.entries(artwork)
					.filter(
						([key, value]) =>
							value &&
							value !== '' &&
							key !== 'id' &&
							key !== 'image_url' &&
							key !== 'alt_text' &&
							key !== 'Title' &&
							key !== 'Description' &&
							key !== 'Artist' &&
							key !== 'color_h' &&
							key !== 'color_s' &&
							key !== 'color_l' &&
							key !== 'Category' &&
							key !== 'width' &&
							key !== 'height' &&
							key !== 'image_id' &&
							key !== 'is_boosted' &&
							value !== 'none' &&
							value !== 'null' &&
							(key === 'Date' || key === 'Place' || key === 'Medium'),
					)
					.sort(([keyA], [keyB]) => {
						const order = ['Date', 'Place', 'Medium', ,]
						const indexA = order.indexOf(keyA)
						const indexB = order.indexOf(keyB)
						return indexA - indexB
					})
					.map(([key, value]) => (
						<li key={key} className="pb-6">
							<span className="list-item font-medium opacity-60">{key}:</span>{' '}
							<span className="detail-content inline-block">{value}</span>
						</li>
					))}
				<li
					className="max-w-prose pb-4 pt-4 leading-relaxed"
					dangerouslySetInnerHTML={description}
				></li>
				{Object.entries({
					Style: artwork.style_titles,
					Subject: artwork.subject_titles,
					Type: artwork.artwork_type_title,
					Technique: artwork.technique_titles,
					Provenance: artwork.provenance_text,
				})
					.filter(
						([_, value]) =>
							value && value !== '' && value !== 'none' && value !== 'null',
					)
					.map(([key, value]) => (
						<li key={key}>
							<span className="list-item font-medium opacity-60">
								{key}
								{': '}
							</span>

							<span className="detail-content inline-block pb-4">{value}</span>
						</li>
					))}
			</ul>
		</>
	)
}

function Logo() {
	return (
		<Link to="/" className="logo group relative z-10 leading-snug">
			<span
				className="text-xl font-medium leading-none transition group-hover:-translate-x-1"
				style={{ color: 'var(--gray-8)' }}
			>
				kunst
			</span>
			<span className="text-xl font-light leading-none text-yellow-100 transition">
				räuber
			</span>
		</Link>
	)
}