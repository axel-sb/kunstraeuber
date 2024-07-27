
import { type MetaFunction } from '@remix-run/node'
import {
	Link,
} from '@remix-run/react'
import { EpicProgress } from '../../components/progress-bar.tsx'

import { Button } from '../../components/ui/button.tsx'
import { Icon } from '../../components/ui/icon.tsx'
import { EpicToaster } from '../../components/ui/sonner.tsx'

import {
} from '../../utils/misc.tsx'


// import styleSheetUrl from './index.css?url'

/* export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: styleSheetUrl }]
} */
export const meta: MetaFunction = () => [{ title: '*Kunsträuber' }]



export default function Index() {


	return (
		<>
			<div className="m-auto flex flex-1 flex-col items-center justify-center px-4 md:max-w-2xl lg:max-w-3xl">
				<figure className="default-picture max-h-fit flex-1 pb-4">
					<img
						className="animate-hue-backdrop scale-down object-center"
						alt="Andy Warhol, Four Mona Lisas. A work made of acrylic and silkscreen ink on linen."
						src="four-mona-lisas-sm.jpg"
						srcSet="four-mona-lisas-sm.jpg 430w, four-mona-lisas.jpg 600w"
					/>
					<figcaption className="text-lg">Four Mona Lisas, 1978</figcaption>
				</figure>
			</div>
			<div className="footer container flex items-center justify-between py-3">
				<Logo />

				<Help />
			</div>
			<EpicToaster closeButton position="top-center" />
			<EpicProgress />
		</>
	)
}

function Logo() {
	return (
		<Link to="/" className="group grid leading-snug">
			<span className="font-light leading-none text-cyan-200 transition group-hover:-translate-x-1">
				kunst
			</span>
			<span className="font-bold leading-none text-yellow-100 transition group-hover:translate-x-1">
				räuber
			</span>
		</Link>
	)
}

//§§ __ ________________________________________ MARK: Help

function Help() {
	return (
		<Button variant="ghost" size="ghost">
			<Icon name="question-mark-circled" className="border-0" size="md"></Icon>
		</Button>
	)
}