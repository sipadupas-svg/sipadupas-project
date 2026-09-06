'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { createPortal } from 'react-dom';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { LayoutDashboard, LogIn, type LucideIcon } from 'lucide-react';
import {
	CalendarCheck,
	FileText,
	Images,
	Info,
	MessageSquareWarning,
	Newspaper,
	PackageOpen,
	Phone,
	ShoppingBag,
	Star,
} from 'lucide-react';
import type { ViewKey } from '@/lib/data';

type NavItem = {
	title: string;
	description?: string;
	icon: LucideIcon;
	view?: ViewKey;
	anchor?: string;
};

type HeaderProps = {
	onNav?: (view: ViewKey) => void;
	onAnchor?: (id: string) => void;
	onLogin?: () => void;
	authenticated?: boolean;
	userLabel?: string;
	onDashboard?: () => void;
};

export function Header({
	onNav,
	onAnchor,
	onLogin,
	authenticated = false,
	userLabel,
	onDashboard,
}: HeaderProps) {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);

	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	const handleNav = (item: NavItem) => {
		setOpen(false);
		if (item.view) onNav?.(item.view);
		else if (item.anchor) onAnchor?.(item.anchor);
	};

	return (
		<header
			className={cn('sticky top-0 z-50 w-full border-b border-transparent', {
				'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg':
					scrolled,
			})}
		>
			<nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<div className="flex items-center gap-5">
					<button
						onClick={() => onNav?.('landing')}
						className="hover:bg-accent flex items-center gap-2.5 rounded-md p-2"
						aria-label="Beranda SIPADUPAS"
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src="/logo.png" alt="Logo SIPADUPAS" className="size-9 rounded-lg shadow-sm" width={36} height={36} />
						<span className="hidden text-left sm:block">
							<span className="block text-sm font-bold leading-tight tracking-[0.08em]">SIPADUPAS</span>
							<span className="text-muted-foreground block text-[10px] font-medium tracking-wide">
								Lapas Kelas IIA Bontang
							</span>
						</span>
					</button>
					<NavigationMenu className="hidden md:flex">
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuTrigger className="bg-transparent">Layanan</NavigationMenuTrigger>
								<NavigationMenuContent className="bg-background p-1 pr-1.5">
									<ul className="bg-popover grid w-lg grid-cols-2 gap-2 rounded-md border p-2 shadow">
										{layananLinks.map((item, i) => (
											<li key={i}>
												<ListItem {...item} onSelect={() => handleNav(item)} />
											</li>
										))}
									</ul>
									<div className="p-2">
										<p className="text-muted-foreground text-sm">
											Butuh bantuan?{' '}
											<button
												onClick={() => onAnchor?.('kontakt')}
												className="text-foreground font-medium hover:underline"
											>
												Hubungi kami
											</button>
										</p>
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuTrigger className="bg-transparent">Informasi</NavigationMenuTrigger>
								<NavigationMenuContent className="bg-background p-1 pr-1.5 pb-1.5">
									<div className="grid w-lg grid-cols-2 gap-2">
										<ul className="bg-popover space-y-2 rounded-md border p-2 shadow">
											{informasiLinks.map((item, i) => (
												<li key={i}>
													<ListItem {...item} onSelect={() => handleNav(item)} />
												</li>
											))}
										</ul>
										<ul className="space-y-2 p-3">
											{informasiLinks2.map((item, i) => (
												<li key={i}>
													<NavigationMenuLink className="hover:bg-accent flex flex-row items-center gap-x-2 rounded-md p-2" asChild>
														<button onClick={() => handleNav(item)}>
															<item.icon className="text-foreground size-4" />
															<span className="font-medium">{item.title}</span>
														</button>
													</NavigationMenuLink>
												</li>
											))}
										</ul>
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuLink className="px-4" asChild>
								<button onClick={() => onAnchor?.('layanan')} className="hover:bg-accent rounded-md p-2">
									Layanan Informasi
								</button>
							</NavigationMenuLink>
						</NavigationMenuList>
					</NavigationMenu>
				</div>
				<div className="hidden items-center gap-2 md:flex">
					{authenticated ? (
						<Button variant="outline" onClick={onDashboard}>
							<LayoutDashboard className="size-4" />
							{userLabel ? `Dashboard ${userLabel.split(' ')[0]}` : 'Dashboard'}
						</Button>
					) : (
						<Button variant="outline" onClick={onLogin}>
							<LogIn className="size-4" />
							Masuk
						</Button>
					)}
					<Button onClick={() => onNav?.('kunjungan')}>Kunjungan Online</Button>
				</div>
				<Button
					size="icon"
					variant="outline"
					onClick={() => setOpen(!open)}
					className="md:hidden"
					aria-expanded={open}
					aria-controls="mobile-menu"
					aria-label="Buka menu navigasi"
				>
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</Button>
			</nav>
			<MobileMenu open={open} className="flex flex-col justify-between gap-2 overflow-y-auto">
				<NavigationMenu className="max-w-full">
					<div className="flex w-full flex-col gap-y-2">
						<span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Layanan</span>
						{layananLinks.map((link) => (
							<ListItem key={link.title} {...link} onSelect={() => handleNav(link)} />
						))}
						<span className="text-muted-foreground mt-3 text-xs font-semibold uppercase tracking-wider">Informasi</span>
						{informasiLinks.map((link) => (
							<ListItem key={link.title} {...link} onSelect={() => handleNav(link)} />
						))}
						{informasiLinks2.map((link) => (
							<ListItem key={link.title} {...link} onSelect={() => handleNav(link)} />
						))}
					</div>
				</NavigationMenu>
				<div className="flex flex-col gap-2 pt-4">
					{authenticated ? (
						<Button variant="outline" className="w-full bg-transparent" onClick={onDashboard}>
							<LayoutDashboard className="size-4" />
							Dashboard
						</Button>
					) : (
						<Button variant="outline" className="w-full bg-transparent" onClick={onLogin}>
							<LogIn className="size-4" />
							Masuk
						</Button>
					)}
					<Button className="w-full" onClick={() => onNav?.('kunjungan')}>
						Kunjungan Online
					</Button>
				</div>
			</MobileMenu>
		</header>
	);
}

type MobileMenuProps = React.ComponentProps<'div'> & {
	open: boolean;
};

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
	if (!open || typeof window === 'undefined') return null;

	return createPortal(
		<div
			id="mobile-menu"
			className={cn(
				'bg-background/95 supports-[backdrop-filter]:bg-background/50 backdrop-blur-lg',
				'fixed top-16 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y md:hidden',
			)}
		>
			<div
				data-slot={open ? 'open' : 'closed'}
				className={cn(
					'data-[slot=open]:animate-in data-[slot=open]:zoom-in-97 ease-out',
					'size-full p-4',
					className,
				)}
				{...props}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}

type ListItemProps = React.ComponentProps<typeof NavigationMenuLink> &
	NavItem & {
		onSelect?: () => void;
	};

function ListItem({
	title,
	description,
	icon: Icon,
	className,
	onSelect,
	...props
}: ListItemProps) {
	return (
		<NavigationMenuLink
			className={cn(
				'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground data-[active=true]:hover:bg-accent data-[active=true]:focus:bg-accent flex w-full flex-row gap-x-2 rounded-sm p-2',
				className,
			)}
			{...props}
			asChild
		>
			<button onClick={onSelect} type="button" className="text-left">
				<div className="bg-background/40 flex aspect-square size-12 items-center justify-center rounded-md border shadow-sm">
					<Icon className="text-foreground size-5" />
				</div>
				<div className="flex flex-col items-start justify-center">
					<span className="font-medium">{title}</span>
					{description && <span className="text-muted-foreground text-xs">{description}</span>}
				</div>
			</button>
		</NavigationMenuLink>
	);
}

/* ── Data navigasi SIPADUPAS ─────────────────────────────────────── */
const layananLinks: NavItem[] = [
	{
		title: 'Kunjungan Online',
		description: 'Booking kunjungan & tiket QR Code',
		icon: CalendarCheck,
		view: 'kunjungan',
	},
	{
		title: 'Barang Titipan',
		description: 'Titip barang untuk WBP dengan tracking',
		icon: PackageOpen,
		view: 'barangTitipan',
	},
	{
		title: 'Pengaduan Publik',
		description: 'Sampaikan pengaduan & pantau statusnya',
		icon: MessageSquareWarning,
		view: 'pengaduan',
	},
	{
		title: 'Survei Kepuasan (SKM)',
		description: 'Beri penilaian atas layanan kami',
		icon: Star,
		view: 'skm',
	},
];

const informasiLinks: NavItem[] = [
	{
		title: 'Berita & Publikasi',
		description: 'Kabar terbaru dari Lapas Bontang',
		icon: Newspaper,
		view: 'berita',
	},
	{
		title: 'Galeri Kegiatan',
		description: 'Dokumentasi kegiatan & pembinaan',
		icon: Images,
		view: 'galeri',
	},
	{
		title: 'Produk WBP',
		description: 'Hasil karya & produk pembinaan WBP',
		icon: ShoppingBag,
		view: 'produk',
	},
	{
		title: 'Tentang Lapas',
		description: 'Profil & sejarah Lapas Kelas IIA Bontang',
		icon: Info,
		view: 'tentang',
	},
];

const informasiLinks2: NavItem[] = [
	{
		title: 'Informasi Layanan',
		icon: FileText,
		view: 'informasi',
	},
	{
		title: 'Kontak & Lokasi',
		icon: Phone,
		anchor: 'kontakt',
	},
];

function useScroll(threshold: number) {
	const [scrolled, setScrolled] = React.useState(false);

	const onScroll = React.useCallback(() => {
		setScrolled(window.scrollY > threshold);
	}, [threshold]);

	React.useEffect(() => {
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, [onScroll]);

	// also check on first load
	React.useEffect(() => {
		onScroll();
	}, [onScroll]);

	return scrolled;
}
