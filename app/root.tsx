// #region imports, links, meta
import {
	json,
	type LoaderFunctionArgs,
	type HeadersFunction,
	type LinksFunction,
	type MetaFunction,
} from '@remix-run/node'
import {
	Form,
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	useLocation,
	// useMatches,
	useSearchParams,
	useSubmit,
} from '@remix-run/react'
import { withSentry } from '@sentry/remix'
import { useId, useRef, useState } from 'react'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import globalStyles from './app.css?url'
import { GeneralErrorBoundary } from './components/error-boundary.tsx'

//import { SearchBar } from './components/search-bar.tsx'
import { useToast } from './components/toaster.tsx'
import { Button } from './components/ui/button.tsx'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from './components/ui/dropdown-menu.tsx'
import { Icon, href as iconsHref } from './components/ui/icon.tsx'
import { Input } from './components/ui/input.tsx'
import { Label } from './components/ui/label.tsx'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './components/ui/select.tsx'
import { StatusButton } from './components/ui/status-button.tsx'
import {
	getAny,
	getArtist,
	getStyle,
	getPlace,
	getDate,
	getColor,
} from './routes/resources+/search-data.server.tsx'
import { ThemeSwitch } from './routes/resources+/theme-switch.tsx'

import tailwindStyleSheetUrl from './styles/tailwind.css?url'
import { getUserId, logout } from './utils/auth.server.ts'
import { ClientHintCheck, getHints } from './utils/client-hints.tsx'
import { prisma } from './utils/db.server.ts'
import { getEnv } from './utils/env.server.ts'
import { honeypot } from './utils/honeypot.server.ts'
import {
	combineHeaders,
	getDomainUrl,
	getUserImgSrc,
	useIsPending,
} from './utils/misc.tsx'
import { useNonce } from './utils/nonce-provider.ts'
import { type Theme, getTheme } from './utils/theme.server.ts'
import { makeTimings, time } from './utils/timing.server.ts'
import { getToast } from './utils/toast.server.ts'
import { useOptionalUser, useUser } from './utils/user.ts'

export const links: LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		{ rel: 'preload', href: iconsHref, as: 'image' },
		{ rel: 'mask-icon', href: '/favicons/mask-icon.svg' },
		{
			rel: 'alternate icon',
			type: 'image/png',
			href: '/favicons/favicon-32x32.png',
		},
		{ rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png' },
		{
			rel: 'manifest',
			href: '/site.webmanifest',
			crossOrigin: 'use-credentials',
		} as const, // necessary to make typescript happy
		{ rel: 'icon', type: 'image/svg+xml', href: '/favicons/favicon.svg' },
		{ rel: 'stylesheet', href: tailwindStyleSheetUrl },
		{ rel: 'stylesheet', href: globalStyles },
	].filter(Boolean)
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data ? '* Kunsträuber' : 'Error | Kunsträuber' },
		{
			name: 'description',
			content: `Good Artists Borrow, Great Artists Steal`,
		},
	]
}
// #endregion imports, links, meta

//§ __ ____________________________________________  MARK: Loader

export async function loader({ request }: LoaderFunctionArgs) {
	const timings = makeTimings('root loader')
	const userId = await time(() => getUserId(request), {
		timings,
		type: 'getUserId',
		desc: 'getUserId in root',
	})

	const user = userId
		? await time(
				() =>
					prisma.user.findUniqueOrThrow({
						select: {
							id: true,
							name: true,
							username: true,
							image: { select: { id: true } },
							roles: {
								select: {
									name: true,
									permissions: {
										select: { entity: true, action: true, access: true },
									},
								},
							},
						},
						where: { id: userId },
					}),
				{ timings, type: 'find user', desc: 'find user in root' },
			)
		: null
	if (userId && !user) {
		console.info('something weird happened')
		// something weird happened... The user is authenticated but we can't find
		// them in the database. Maybe they were deleted? Let's log them out.
		await logout({ request, redirectTo: '/' })
	}
	const { toast, headers: toastHeaders } = await getToast(request)
	const honeyProps = honeypot.getInputProps()

	const url = new URL(request.url)
	const query = url.searchParams.get('search') ?? undefined
	const searchType = url.searchParams.get('searchType') ?? ''

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
			break
		/* data = await getArtist('Picasso') */
	}

	return json(
		{
			user,
			data,
			searchType,
			requestInfo: {
				hints: getHints(request),
				origin: getDomainUrl(request),
				path: new URL(request.url).pathname,
				userPrefs: {
					theme: getTheme(request),
				},
			},
			ENV: getEnv(),
			toast,
			honeyProps,
		},
		{
			headers: combineHeaders(
				{ 'Server-Timing': timings.toString() },
				toastHeaders,
			),
		},
	)
	console.log('🟡 searchType →', searchType)
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	const headers = {
		'Server-Timing': loaderHeaders.get('Server-Timing') ?? '',
	}
	return headers
}

function Document({
	children,
	nonce,
	theme = 'dark',
	env = {},
	allowIndexing = true,
}: {
	children: React.ReactNode
	nonce: string
	theme?: Theme
	env?: Record<string, string>
	allowIndexing?: boolean
}) {
	return (
		<html lang="en" className={`${theme} h-full overflow-x-hidden`}>
			<head>
				<ClientHintCheck nonce={nonce} />
				<Meta />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				{allowIndexing ? null : (
					<meta name="robots" content="noindex, nofollow" />
				)}
				<Links />
			</head>
			<body className="h-dvh w-full flex flex-col bg-background text-foreground">
				{children}
				<script
					nonce={nonce}
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(env)}`,
					}}
				/>
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
			</body>
		</html>
	)
}

/**
 * React component for the main App. It handles various hooks and state variables, including user data, theme, search parameters, and more.
 *
 * @return {React.ReactNode} The main React component for the entire application.
 */

function App() {
	const data = useLoaderData<typeof loader>()
	const nonce = useNonce()
	const user = useOptionalUser()
	// const matches = useMatches()
	// const isOnSearchPage = matches.find((m) => m.id === 'routes/users+/index')
	// const searchBar = isOnSearchPage ? null : <SearchBar status="idle" />
	const allowIndexing = data.ENV.ALLOW_INDEXING !== 'false'
	useToast(data.toast)
	const id = useId()
	const isPending = useIsPending()
	const location = useLocation()

	const [searchParams, setsearchParams] = useSearchParams()
	const [searchType, setSearchType] = useState<
		| 'all'
		| 'artist'
		| 'style'
		| 'place'
		| 'date'
		| 'color'
		| 'subject'
		| 'term'
		| ''
	>('')

	// console.log('🟡 matches =', matches)
	/* 2024-07-17 prevent auto submit (commented out)
    const submit = useSubmit()
	const handleFormChange = useDebounce((form: HTMLFormElement) => {
		submit(form)
	}, 400)
    // const isSubmitting = useIsPending({
		formMethod: 'GET',
		formAction: '/users',
	})
	// const isPending = useIsPending()
	// const formRef = useRef<HTMLFormElement>(null)
	// const isOnSearchPage = matches.find((m) => m.id === 'routes/users+/index')
	// console.log('🔵 location →', location)
    */
	return (
		<Document nonce={nonce} allowIndexing={allowIndexing} env={data.ENV}>
			{location.pathname === '/' ? (
				<header className="container py-6">
					<nav className="flex flex-wrap items-center justify-between gap-4 md:max-w-2xl md:flex-nowrap md:gap-8 lg:max-w-3xl m-auto">
						{/* <Logo /> */}
						<div className="flex items-center gap-10">
							{user ? (
								<UserDropdown />
							) : (
								<Button asChild variant="default" size="lg">
									<Link to="/login">Log In</Link>
								</Button>
							)}
						</div>
						{/*  //§§                                   MARK: Search Bar */}

						<div className="search-bar block w-full rounded-md ring-0 ring-yellow-100/50 ring-offset-[.5px] ring-offset-yellow-50/50 lg:max-w-4xl xl:max-w-5xl">
							<Form
								method="GET"
								action="/artworks/"
								className="no-wrap flex items-center justify-center gap-2"
								/* onChange={(e) => handleFormChange(e.currentTarget)} */
							>
								{/* //§§  __ __________________________ MARK: SearchInput  */}
								{/* //§§  https://www.jacobparis.com/ui/combobox-multiple  */}

								{/* To explicitly associate a <label> element with an <input> element, you first need to add the id attribute to the <input> element. Next, you add the for attribute to the <label> element, where the value of for is the same as the id in the <input> element.

                                Alternatively, you can nest the <input> directly inside the <label>, in which case the for and id attributes are not needed because the association is implicit: */}

								<div className="flex-1 rounded-md">
									<Label htmlFor={id} className="sr-only">
										Search
									</Label>
									<Input
										id={id}
										type="search"
										name="search"
										defaultValue={searchParams.get('search') ?? ''}
										placeholder={`Search ${searchType}`}
										className="w-full border-0"
										onChange={(e) => setsearchParams(e.target.value)}
									/>
								</div>
								<div className="splitbutton flex max-w-sm flex-[.5] rounded-md">
									<SelectSearchType
										searchType={searchType}
										setSearchType={setSearchType}
									/>

									{/* //§§  __  ______________  MARK: Status Button */}

									<StatusButton
										type="submit"
										status={isPending ? 'pending' : 'idle'}
										className="flex flex-1 items-center justify-center border-0 pl-4 pr-2 shadow-none"
									>
										<Icon name="magnifying-glass" size="lg" />
										<span className="sr-only">Search</span>
									</StatusButton>
								</div>
							</Form>
						</div>
					</nav>
				</header>
			) : null}

			<Outlet />

			{/*
            //§§  __ ___________________ MARK: Footer, Logo, Toaster */}

			{/* <div className="footer container flex items-center justify-between py-3">
				<Logo />
				<ThemeSwitch userPreference={data.requestInfo.userPrefs.theme} />
				<Help />
			</div>
			<EpicToaster closeButton position="top-center" theme={theme} />
			<EpicProgress /> */}

			<ThemeSwitch userPreference={data.requestInfo.userPrefs.theme} />
		</Document>
	)
}

function AppWithProviders() {
	const data = useLoaderData<typeof loader>()
	return (
		<HoneypotProvider {...data.honeyProps}>
			<App />
		</HoneypotProvider>
	)
}

export default withSentry(AppWithProviders)

function UserDropdown() {
	const user = useUser()
	const submit = useSubmit()
	const formRef = useRef<HTMLFormElement>(null)
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button asChild variant="secondary">
					<Link
						to={`/users/${user.username}`}
						// this is for progressive enhancement
						onClick={(e) => e.preventDefault()}
						className="flex items-center gap-2"
					>
						<img
							className="h-8 w-8 rounded-full object-cover"
							alt={user.name ?? user.username}
							src={getUserImgSrc(user.image?.id)}
						/>
						<span className="text-body-sm font-bold">
							{user.name ?? user.username}
						</span>
					</Link>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent sideOffset={8} align="start">
					<DropdownMenuItem asChild>
						<Link prefetch="intent" to={`/users/${user.username}`}>
							<Icon className="text-body-md" name="avatar">
								Profile
							</Icon>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link prefetch="intent" to={`/users/${user.username}/notes`}>
							<Icon className="text-body-md" name="pencil-2">
								Notes
							</Icon>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem
						asChild
						// this prevents the menu from closing before the form submission is completed
						onSelect={(event) => {
							event.preventDefault()
							submit(formRef.current)
						}}
					>
						<Form action="/logout" method="POST" ref={formRef}>
							<Icon className="text-body-md" name="exit">
								<button type="submit">Logout</button>
							</Icon>
						</Form>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	)
}

//§ __ ____________________________________  MARK: SelectSearchType

interface SelectSearchTypeProps {
	searchType:
		| ''
		| 'color'
		| 'style'
		| 'date'
		| 'all'
		| 'artist'
		| 'place'
		| 'subject'
		| 'term'
	setSearchType: React.Dispatch<
		React.SetStateAction<
			| ''
			| 'color'
			| 'style'
			| 'date'
			| 'all'
			| 'artist'
			| 'place'
			| 'subject'
			| 'term'
		>
	>
}

function SelectSearchType({
	searchType,
	setSearchType,
}: SelectSearchTypeProps) {
	return (
		<Select
			name="searchType"
			value={searchType}
			onValueChange={(value) => {
				const searchType = value as
					| 'all'
					| 'artist'
					| 'style'
					| 'place'
					| 'date'
					| 'color'

				setSearchType(searchType)

				if (searchType === 'color') {
					window.location.href = '/artworks/colorSearch'
				}
			}}
		>
			<SelectTrigger className="w-full">
				<SelectValue placeholder={searchType ? `${searchType}` : 'All'} />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">All</SelectItem>
				<SelectItem value="artist">Artist</SelectItem>
				<SelectItem value="style">Style</SelectItem>
				<SelectItem value="place">Place</SelectItem>
				<SelectItem value="date">Date</SelectItem>
				<SelectItem value="color">Color</SelectItem>
			</SelectContent>
		</Select>
	)
}

export function ErrorBoundary() {
	// the nonce doesn't rely on the loader so we can access that
	const nonce = useNonce()

	// NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
	// likely failed to run so we have to do the best we can.
	// We could probably do better than this (it's possible the loader did run).
	// This would require a change in Remix.

	// Just make sure your root route never errors out and you'll always be able
	// to give the user a better UX.

	return (
		<Document nonce={nonce}>
			<GeneralErrorBoundary />
		</Document>
	)
}
