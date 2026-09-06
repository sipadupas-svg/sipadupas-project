'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type MenuToggleIconProps = React.ComponentProps<'svg'> & {
	open: boolean;
	duration?: number;
};

/**
 * Animated hamburger / close menu icon.
 * Animates between a 3-line hamburger and an X when `open` is true.
 */
export function MenuToggleIcon({
	open,
	duration = 250,
	className,
	...props
}: MenuToggleIconProps) {
	const transition = `all ${duration}ms ease`;

	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			className={className}
			{...props}
		>
			{/* Top line — fades out, slightly slides up when open */}
			<line
				x1="4"
				y1="7"
				x2="20"
				y2="7"
				style={{
					transition,
					opacity: open ? 0 : 1,
					transform: open ? 'translateY(-2px)' : 'none',
				}}
			/>
			{/* Middle line — rotates to "\" */}
			<line
				x1="4"
				y1="12"
				x2="20"
				y2="12"
				style={{
					transition,
					transformOrigin: '12px 12px',
					transform: open ? 'rotate(45deg)' : 'none',
				}}
			/>
			{/* Bottom line — moves to middle and rotates to "/" */}
			<line
				x1="4"
				y1="17"
				x2="20"
				y2="17"
				style={{
					transition,
					transformOrigin: '12px 12px',
					transform: open ? 'translateY(-5px) rotate(-45deg)' : 'none',
				}}
			/>
		</svg>
	);
}
