import * as React from 'react'
import { type JSX } from 'react/jsx-runtime'
const SVGComponent = (
	props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>,
) => (
	<svg
		xmlns="http://svgjs.dev/svgjs"
		width={15}
		height={15}
		fill="none"
		viewBox="0 0 15 15"
		{...props}
	>
		<filter id="diffuseLighting" x="0" y="10" width="100%" height="100%">
			<feDiffuseLighting in="SourceGraphic" lightingColor="white">
				<fePointLight x="0" y="0" z=".5" />
			</feDiffuseLighting>
		</filter>

		<rect
			x="0"
			y="0"
			width="15"
			height="15"
			rx="7.5"
			style={{
				filter: 'url(#diffuseLighting)',
			}}
		/>

		<circle
			cx="7.5"
			cy="7.5"
			r="7.5"
			style={{
				filter: 'url(#diffuseLighting)',
			}}
		/>

		<path
			fill="#fff8"
			stroke="#000"
			strokeWidth={1}
			fillRule="nonzero"
			strokeOpacity={0.75}
			d="M7.5 11.541c3.086 0 5.764 -1.975 7.097 -3.165 0.537 -0.48 0.537 -1.281 0 -1.76 -1.333 -1.19 -4.011 -3.165 -7.097 -3.165 -3.086 0 -5.764 1.975 -7.097 3.165 -0.537 0.48 -0.537 1.281 0 1.76 1.333 1.19 4.011 3.165 7.097 3.165Zm0 -1.223c1.559 0 2.822 -1.264 2.822 -2.822S9.059 4.673 7.5 4.673 4.678 5.937 4.678 7.495s1.264 2.822 2.822 2.822Z"
			clipRule="evenodd"
		/>
		<circle cx={7.5} cy={7.5} r={3.5} fill="currentColor" fillOpacity={.8} stroke='#fff1' strokeWidth={.5} />
		<circle
			cx={7.5}
			cy={7.5}
			r={1}
			fill="#000"
			stroke="#000 "
		/>
	</svg>
)
export default SVGComponent
