import { Logo } from "./Logo";
import { Nav } from "./nav/Nav";

export function Header({ channel }: { channel: string }) {
	return (
		<header className="relative top-0 z-20 overflow-visible border-b border-[#EEEEEE] bg-white/95 backdrop-blur-md">
			<div className="relative mx-auto max-w-[1200px] overflow-visible px-3 sm:px-8">
				<div className="relative flex h-16 justify-between gap-4 overflow-visible md:gap-8">
					<Logo />
					<Nav channel={channel} />
				</div>
			</div>
		</header>
	);
}
