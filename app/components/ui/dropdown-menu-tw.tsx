import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
// // import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { clsx } from 'clsx'
import * as React from 'react'
import {  useState } from 'react'
// import { cn } from '#app/utils/misc.tsx'
import { Button } from './button.tsx'

import { Icon } from './icon.tsx'

interface RadixMenuItem {
	label: string
	shortcut?: string
	icon?: React.ReactNode
}

interface User {
	name: string
	url?: string
}

const generalMenuItems: RadixMenuItem[] = [
	{
		label: 'New File',
		icon: <Icon name="cross-1"  className="mr-2 h-3.5 w-3.5" />,
		shortcut: '⌘+N',
	},
	{
		label: 'Settings',
		icon: <Icon name="cross-1"  className="mr-2 h-3.5 w-3.5" />,
		shortcut: '⌘+,',
	},
]

const regionToolMenuItems: RadixMenuItem[] = [
	{
		label: 'Frame',
		icon: <Icon name="cross-1"  className="mr-2 h-3.5 w-3.5" />,
		shortcut: '⌘+F',
	},
	{
		label: 'Crop',
		icon: <Icon name="cross-1"  className="mr-2 h-3.5 w-3.5" />,
		shortcut: '⌘+S',
	},
]

const users: User[] = [
	{
		name: 'Adam',
		url: 'https://github.com/adamwathan.png',
	},
	{
		name: 'Steve',
		url: 'https://github.com/steveschoger.png',
	},
	{
		name: 'Robin',
		url: 'https://github.com/robinmalfait.png',
	},
]

const DropdownMenu = () => {
	const [showGrid, setShowGrid] = useState(false)
	const [showUi, setShowUi] = useState(false)

	return (
		<div className="relative inline-block text-left">
			<DropdownMenuPrimitive.Root>
				<DropdownMenuPrimitive.Trigger asChild>
					<Button>Click</Button>
				</DropdownMenuPrimitive.Trigger>

				<DropdownMenuPrimitive.Portal>
					<DropdownMenuPrimitive.Content
						align="end"
						sideOffset={5}
						className={clsx(
							'radix-side-top:animate-slide-up radix-side-bottom:animate-slide-down',
							'w-48 rounded-lg px-1.5 py-1 shadow-md md:w-56',
							'bg-white dark:bg-gray-800',
						)}
					>
						{generalMenuItems.map(({ label, icon, shortcut }) => (
							<DropdownMenuPrimitive.Item
								key={`dropdown-item-${label}`}
								className={clsx(
									'flex cursor-default select-none items-center rounded-md px-2 py-2 text-xs outline-none',
									'text-gray-400 focus:bg-gray-50 dark:text-gray-500 dark:focus:bg-gray-900',
								)}
							>
								{icon}
								<span className="flex-grow text-gray-700 dark:text-gray-300">
									{label}
								</span>
								{shortcut && <span className="text-xs">{shortcut}</span>}
							</DropdownMenuPrimitive.Item>
						))}

						<DropdownMenuPrimitive.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

						<DropdownMenuPrimitive.CheckboxItem
							checked={showGrid}
							onCheckedChange={(state) => {
								if (typeof state === 'boolean') {
									setShowGrid(state)
								}
							}}
							className={clsx(
								'flex w-full cursor-default select-none items-center rounded-md px-2 py-2 text-xs outline-none',
								'text-gray-400 focus:bg-gray-50 dark:text-gray-500 dark:focus:bg-gray-900',
							)}
						>
							{showGrid ? (
								<Icon name="cross-1"  className="mr-2 h-4 w-4" />
							) : (
								<Icon name="cross-1"  className="mr-2 h-3.5 w-3.5 text-gray-700 dark:text-gray-300" />
							)}
							<span className="flex-grow text-gray-700 dark:text-gray-300">
								Show Grid
							</span>
							<DropdownMenuPrimitive.ItemIndicator>
								<Icon name="cross-1"  className="h-3.5 w-3.5" />
							</DropdownMenuPrimitive.ItemIndicator>
						</DropdownMenuPrimitive.CheckboxItem>

						<DropdownMenuPrimitive.CheckboxItem
							checked={showUi}
							onCheckedChange={(state) => {
								if (typeof state === 'boolean') {
									setShowUi(state)
								}
							}}
							className={clsx(
								'flex w-full cursor-default select-none items-center rounded-md px-2 py-2 text-xs outline-none',
								'text-gray-400 focus:bg-gray-50 dark:text-gray-500 dark:focus:bg-gray-900',
							)}
						>
							{showUi ? (
								<Icon name="cross-1"  className="mr-2 h-3.5 w-3.5" />
							) : (
								<Icon name="cross-1"  className="mr-2 h-3.5 w-3.5" />
							)}
							<span className="flex-grow text-gray-700 dark:text-gray-300">
								Show UI
							</span>
							<DropdownMenuPrimitive.ItemIndicator>
								<Icon name="cross-1"  className="h-3.5 w-3.5" />
							</DropdownMenuPrimitive.ItemIndicator>
						</DropdownMenuPrimitive.CheckboxItem>

						<DropdownMenuPrimitive.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

						<DropdownMenuPrimitive.Label className="select-none px-2 py-2 text-xs text-gray-700 dark:text-gray-200">
							Region Tools
						</DropdownMenuPrimitive.Label>

						{regionToolMenuItems.map(({ label, icon, shortcut }) => (
							<DropdownMenuPrimitive.Item
								key={`region-tool-menu-item-${label}`}
								className={clsx(
									'flex cursor-default select-none items-center rounded-md px-2 py-2 text-xs outline-none',
									'text-gray-400 focus:bg-gray-50 dark:text-gray-500 dark:focus:bg-gray-900',
								)}
							>
								{icon}
								<span className="flex-grow text-gray-700 dark:text-gray-300">
									{label}
								</span>
								{shortcut && <span className="text-xs">{shortcut}</span>}
							</DropdownMenuPrimitive.Item>
						))}

						<DropdownMenuPrimitive.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

						<DropdownMenuPrimitive.Sub>
							<DropdownMenuPrimitive.SubTrigger
								className={clsx(
									'flex w-full cursor-default select-none items-center rounded-md px-2 py-2 text-xs outline-none',
									'text-gray-400 focus:bg-gray-50 dark:text-gray-500 dark:focus:bg-gray-900',
								)}
							>
								<Icon name="cross-1"  className="mr-2 h-3.5 w-3.5" />
								<span className="flex-grow text-gray-700 dark:text-gray-300">
									Share
								</span>
								<Icon name="cross-1"  className="h-3.5 w-3.5" />
							</DropdownMenuPrimitive.SubTrigger>
							<DropdownMenuPrimitive.Portal>
								<DropdownMenuPrimitive.SubContent
									className={clsx(
										'radix-side-right:animate-scale-in origin-radix-dropdown-menu',
										'w-full rounded-md px-1 py-1 text-xs shadow-md',
										'bg-white dark:bg-gray-800',
									)}
								>
									{users.map(({ name, url }) => (
										<DropdownMenuPrimitive.Item
											key={`${name}-${url}`}
											className={clsx(
												'flex w-28 cursor-default select-none items-center rounded-md px-2 py-2 text-xs outline-none md:w-32',
												'text-gray-400 focus:bg-gray-50 dark:text-gray-500 dark:focus:bg-gray-900',
											)}
										>
											{url ? (
												<img
													aria-label={name}
													className="mr-2.5 h-6 w-6 rounded-full"
													src={url}
												/>
											) : (
												<Icon name="cross-1"  className="mr-2.5 h-6 w-6" />
											)}
											<span className="text-gray-700 dark:text-gray-300">
												{name}
											</span>
										</DropdownMenuPrimitive.Item>
									))}
								</DropdownMenuPrimitive.SubContent>
							</DropdownMenuPrimitive.Portal>
						</DropdownMenuPrimitive.Sub>
					</DropdownMenuPrimitive.Content>
				</DropdownMenuPrimitive.Portal>
			</DropdownMenuPrimitive.Root>
		</div>
	)
}

export { DropdownMenu }