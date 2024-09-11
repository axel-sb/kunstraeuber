import MeshGradient from 'mesh-gradient.js'
import { useEffect, useMemo } from 'react'

/* const COLORS = [ "#eb75b6",
  "#ddf3ff",
  "#6e3deb",
  "#c92f3c" ]

function MeshGradients2() {
  const gradient = useMemo(() => new MeshGradient(), []);

  const canvasId = "my-canvas"

  useEffect(() => {
    // initialize new gradient
    // @Params
    // 1. id of canvas element
    // 2. array of colors in hexcode
    gradient.initGradient("#" + canvasId, COLORS);
    // Mesh Id
    // Any positive numeric value which acts as a seed for mesh pattern
    gradient?.changePosition(780);
  }, [gradient, canvasId]);

  const regenerate = () => {
    const value = Math.floor(Math.random() * 1000)
    // change pattern by changing mesh Id
    gradient?.changePosition(value);
  } */

function MeshGradients(colorH: number, colorS: number, colorL = 15) {
	function hslToHex(colorH: number, colorS: number, colorL: number) {
		colorL /= 100
		const a = (colorS * Math.min(colorL, 1 - colorL)) / 100
		const f = (n: number): string => {
			const k = (n + colorH / 30) % 12
			const color = colorL - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
			return Math.round(255 * color)
				.toString(16)
				.padStart(2, '0') // convert to Hex and prefix "0" if needed
		}
		return `#${f(0)}${f(8)}${f(4)}` // #918669, #91866980
	}

	function hslToHexDark(colorH: number, colorS: number, colorL = 20): string {
		colorL /= 100
		const a = (colorS * Math.min(colorL, 1 - colorL)) / 100
		const f = (n: number): string => {
			const k = (n + colorH / 30) % 12
			const color = colorL - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
			return Math.round(255 * color)
				.toString(16)
				.padStart(2, '0') // convert to Hex and prefix "0" if needed
		}
		return `#${f(0)}${f(8)}${f(4)}` // #918669, #91866980
	}

	function hslToHexDarker(colorH: number, colorS: number, colorL = 10): string {
		colorL /= 100
		const a = (colorS * Math.min(colorL, 1 - colorL)) / 100
		const f = (n: number): string => {
			const k = (n + colorH / 30) % 12
			const color = colorL - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
			return Math.round(255 * color)
				.toString(16)
				.padStart(2, '0') // convert to Hex and prefix "0" if needed
		}
		return `#${f(0)}${f(8)}${f(4)}` // #918669, #91866980
	}

	console.log('hslToHex', hslToHex(colorH ?? 0, colorS ?? 0, colorL ?? 30))
	console.log(
		'hslToHexDark',
		hslToHexDark(colorH ?? 0, colorS ?? 0, colorL ?? 20),
	)
	console.log(
		'hslToHexDarker',
		hslToHexDarker(colorH ?? 0, colorS ?? colorL ?? 10),
	)

	const gradient = useMemo(() => new MeshGradient(), [])

	const canvasId = 'my-canvas'

	useEffect(() => {
		// const COLORS = ['#4a4a3d', '#3f3f34', '#1d1d18', '#1f1f1a', '#fffed0']
		const COLORS = [
			`${hslToHex(colorH, colorS, 10)}`,
			`${hslToHexDark(colorH, colorS, 0)}`,
			`${hslToHexDarker(colorH, colorS, 40)}`,
			`${hslToHex(colorH, colorS, 15)}`,
			`${hslToHexDark(colorH, colorS, 5)}`,
			`${hslToHexDarker(colorH, colorS, 12)}`,
			`${hslToHex(colorH, colorS, 0)}`,
			`${hslToHexDark(colorH, colorS, 8)}`,
		]
		console.log('COLORS', COLORS)
		// the log shows : `(3) ['#e9ab25', '#e9ab25', '#e9ab25']`
		// but there should be 3 different hex colors

		// initialize new gradient
		// @Params
		// 1. id of canvas element
		// 2. array of colors in hexcode
		gradient.initGradient('#' + canvasId, COLORS)
		// Mesh Id
		// Any positive numeric value which acts as a seed for mesh pattern
		gradient?.changePosition(780)
	}, [gradient, canvasId, colorH, colorL, colorS])

	const regenerate = () => {
		const value = Math.floor(Math.random() * 1000)
		// change pattern by changing mesh Idfocus terminal

		gradient?.changePosition(value)
	}

	return (
		<div className="absolute">
			<canvas id={canvasId} width="800" height="800" />
			<button onClick={() => regenerate()}> Regenerate </button>
		</div>
	)
}

export default MeshGradients

// https://www.codemotion.com/magazine/frontend/javascript/the-best-color-manipulation-library-in-javascript/
