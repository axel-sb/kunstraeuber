// #region  import export
import {
	// type LinksFunction,
	type LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import { Link, NavLink, useLoaderData, useLocation } from '@remix-run/react'
import chalk from 'chalk'
import React from 'react'
import { Icon } from '#app/components/ui/icon.js'
import {
	getAny,
	getArtist,
	getStyle,
	getPlace,
	getDate,
	getColor,
} from '../resources+/search-data.server'
//import artworks from './artworks.index.css?url'
/* export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: artworks },
] */

/* //§§   _________________________________ MARK: Loader
   This function is only ever run on the server. On the initial server render, it will provide data to the HTML document. On navigations in the browser, Remix will call the function via fetch from the browser.This means you can talk directly to your database, use server-only API secrets, etc. Any code that isn't used to render the UI will be removed from the browser bundle. */
export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const query = url.searchParams.get('search') ?? 'no query provided'
	const searchType =
		url.searchParams.get('searchType') ?? 'no search type selected'

	let data
	switch (searchType) {
		case 'all':
			data = await getAny(query)
			break
		case 'artist':
			data = await getArtist(query)
			break
		case 'style':
			data = await getStyle(query)
			break
		case 'place':
			data = await getPlace(query)
			break
		case 'date':
			data = await getDate(Number(query))
			break
		case 'color':
			data = await getColor((query ?? '').toString())
			break

		default:
			data = await getAny('Picasso') // break
	}
	return json({ searchType, query, data })
}

// #endregion import export

//+                                            export default
// MARK: Export default
export default function ArtworksPage() {
	const { data, query } = useLoaderData<typeof loader>()
	const location = useLocation()
	const searchType = useLoaderData<typeof loader>().searchType
	// const colorHsl = useLoaderData<typeof loader>()

	console.log(
		chalk.blue(
			console.group('Object.entries(location).map(([k, v]) ➜ '),
			Object.entries(location).map(([k, v]) => `${chalk.red(k)}: ${v}  \n`),
		),
	)
	//§  .............................  MARK: radio btns hook
	const [grid, setgrid] = React.useState('grid-1')

	const handleGrid1Change = () => {
		setgrid('grid-1')
	}
	const handleGrid2Change = () => {
		setgrid('grid-2')
	}
	const handleGrid3Change = () => {
		setgrid('grid-3')
	}

	type RadioButtonProps = {
		value: string
		name: 'grid-1' | 'grid-2' | 'grid-3'
		onChange: () => void
	}
	const RadioButton = ({ value, name, onChange }: RadioButtonProps) => {
		const checked = value === name

		return (
			<label>
				<input
					type="radio"
					name={name}
					checked={checked}
					onChange={() => onChange()}
					className="group invisible h-0 has-[input[type='radio']:checked]:text-yellow-100"
				/>
				<Icon
					name={name}
					size="font"
					className="text-slate-600 group-has-[input[type='radio']:checked]:inline-flex group-has-[input[type='radio']:checked]:animate-pulse group-has-[input[type='radio']:checked]:text-slate-100"
				/>
			</label>
		)
	}
	/* // !. _____________________________________________________________________  	MARK: return
	 */
	return (
		<>
			{/* // !.			__________________________________________________________			MARK: header
			 */}

			<header className="container grid max-w-[843px] grid-cols-[1fr_1fr] grid-rows-1 justify-between gap-4 rounded-bl-2xl rounded-br-2xl py-6">
				<Logo />
				{/*
           //§ ............................. MARK: radio btn group
        */}

				<form className="form place-self-center">
					<div className="group/radio grid grid-cols-3 place-items-center rounded border-[0.5px] border-solid border-slate-500/50 pb-1 pl-0 pr-3 pt-0 text-lg text-yellow-50/50 md:gap-4 md:text-xl">
						<RadioButton
							name="grid-1"
							value={grid}
							onChange={handleGrid1Change}
						/>
						<RadioButton
							name="grid-2"
							value={grid}
							onChange={handleGrid2Change}
						/>

						<RadioButton
							name="grid-3"
							value={grid}
							onChange={handleGrid3Change}
						/>
					</div>
				</form>
			</header>
			<main className="flex items-center justify-center px-4 py-16 sm:p-10 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
				{/*{' '}
				<ul className="artworks-fade-in group grid w-screen max-w-screen-xl grid-flow-row-dense gap-2 group-has-[label:nth-child(1)>input[type='radio']:checked]/body:grid-cols-1 group-has-[label:nth-child(2)>input[type=radio]:checked]/body:grid-cols-2 group-has-[label:nth-child(3)>input[type=radio]:checked]/body:grid-cols-3 md:gap-24 xl:gap-48">
					{' '}
					*/}

				<ul className="max-h-[250rem] w-full gap-x-[3%] [column-fill:balance] [column-width:300px]">
					{data !== undefined && data.length > 0 ? (
						data.map((artwork) => (
							<li
								key={artwork.id}
								className="flex max-h-fit items-center justify-center"
								style={{
									containerType: 'inline-size',
									containerName: 'list-item',
								}}
							>
								<NavLink
									className={({ isActive, isPending }) =>
										isActive ? 'active' : isPending ? 'pending' : '' + 'w-full'
									}
									to={`./${artwork.id}`}
								>
									<figure className="relative flex w-full flex-col gap-2">
										<img
											alt={artwork.alt_text ?? undefined}
											key={artwork.id}
											src={artwork.image_url ?? '../dummy.jpeg'}
											className="rounded-md md:rounded-lg"
										/>

										{/*
                       //§   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .    MARK: Figcaption
                  */}
										<figcaption className="z-50 flex w-full flex-wrap justify-between whitespace-normal">
											<div className="group-has-[input[type=radio]]:grid-cols-2]:justify-self-start relative flex w-full flex-wrap">
												<div className="">
													{artwork.title} {'  '}
												</div>
												<div className="figcaption-artist w-[calc(100%-1.5rem)] font-semibold opacity-50">
													{artwork.artist_title}
												</div>
												<div className="w-full pt-2">
													<Icon
														name="eye-open"
														size="font"
														className="icon-eye block"
														style={{
															color: artwork.colorHsl as string,
														}}
													/>
												</div>
												{/*{' '}
												<Icon
													name="arrow-right"
													className="icon-arrow hidden h-4 w-4 justify-self-end lg:ml-[calc(100%-3rem)] lg:mt-4"
													style={{
														color: artwork.colorHsl as string,
													}}
												/>{' '}
												*/}
											</div>
										</figcaption>
									</figure>
								</NavLink>
							</li>
						))
					) : (
						<section className="col-span-3 p-10">
							<h2 className="mx-auto w-full text-lg text-yellow-50">
								Nothing found for: {'  '}
								<strong>
									<em> " {query} " </em>
								</strong>
							</h2>
							<h3 className="font-semibold opacity-80">
								Search type: <em> " {searchType} " </em>
							</h3>
						</section>
					)}
				</ul>
			</main>

			<Footer />
		</>
	)
}

//§   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .    MARK: Logo

function Logo() {
	return (
		<Link to="/" className="group/logo grid leading-snug">
			<span className="font-light leading-none text-cyan-200 transition group-hover/logo:-translate-x-1">
				kunst
			</span>
			<span className="font-bold leading-none text-yellow-100 transition group-hover/logo:translate-x-1">
				räuber
			</span>
		</Link>
	)
}
//§   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .    MARK: Footer

function Footer() {
	const searchType = useLoaderData<typeof loader>().searchType
	const query = useLoaderData<typeof loader>().query
	return (
		<footer className="search-params relative col-span-2 flex items-center justify-between gap-4 px-4 py-6">
			<div className="text-center leading-none">
				<span className="font-semibold opacity-50">search </span>
				<span>
					<em className="font-normal opacity-100">
						{searchType} <Icon name="arrow-right" />
					</em>{' '}
				</span>
				{query || ' '}{' '}
				{/* same as: {location.search.split('&')[0].split('=')[1]} */}
			</div>

			<div className="text-right leading-none">
				<span className="font-semibold opacity-50">page: </span>{' '}
				<em className="font-normal opacity-100">{useLocation().pathname} </em>{' '}
			</div>
		</footer>
	)
}
