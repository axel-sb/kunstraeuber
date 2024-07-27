import CloverImage from '@samvera/clover-iiif/image'

interface ViewerProps {
	src: string
	isTiledImage: boolean
	options: {
		openSeadragon: {
			gestureSettingsMouse: {
				scrollToZoom: true
			}
			ViewerProps: {
				showNavigator: boolean
			}
		}
	}
}

export default function Viewer({ src, isTiledImage  }: ViewerProps) {
	return (
		<div style={{ height: '100dvh' }}>
			<CloverImage
				src={src}
				isTiledImage={isTiledImage}
			/>
		</div>
	)
}
