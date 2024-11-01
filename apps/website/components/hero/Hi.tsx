import { ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";

const Hero12 = () => {
	return (
		<section className="relative overflow-hidden py-32 bg-black">
			<div className="absolute inset-0 overflow-hidden">
				<div className="flex h-full flex-col items-center justify-end">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 1400 900"
						className="-mx-[theme(container.padding)] h-full w-[calc(100%+2*theme(container.padding))]"
					>
						<defs>
							<filter id="blur1" x="-20%" y="-20%" width="140%" height="140%">
								<feFlood flood-opacity="0" result="BackgroundImageFix" />
								<feBlend
									mode="normal"
									in="SourceGraphic"
									in2="BackgroundImageFix"
									result="shape"
								/>
								<feGaussianBlur
									stdDeviation="200"
									result="effect1_foregroundBlur"
								/>
							</filter>
							<pattern
								id="innerGrid"
								width="40"
								height="40"
								patternUnits="userSpaceOnUse"
							>
								<path
									d="M 40 0 L 0 0 0 40"
									fill="none"
									stroke="hsl(var(--background))"
									stroke-width="0.5"
									stroke-opacity="0.6"
								/>
							</pattern>
							<pattern
								id="grid"
								width="160"
								height="160"
								patternUnits="userSpaceOnUse"
							>
								<rect width="160" height="160" fill="url(#innerGrid)" />
								<path
									d="M 70 80 H 90 M 80 70 V 90"
									fill="none"
									stroke="hsl(var(--background))"
									stroke-width="1"
									stroke-opacity="0.3"
								/>
							</pattern>
						</defs>
						<g filter="url(#blur1)">
							<rect width="1400" height="900" fill="hsl(var(--background))" />
							<circle
								cx="400"
								cy="740"
								fill="hsl(var(--primary)/0.2)"
								r="300"
							/>
							<circle
								cx="1100"
								cy="600"
								fill="hsl(var(--primary)/0.3)"
								r="240"
							/>
						</g>
						<rect width="1400" height="900" fill="url(#grid)" />
					</svg>
				</div>
			</div>
			<div className="container relative flex flex-col items-center text-center">
				<h1 className="my-3 text-pretty text-2xl font-bold sm:text-4xl md:my-6 lg:text-5xl">
					Welcome to Our Website
				</h1>
				<p className="text-muted-foreground mb-6 max-w-xl md:mb-12 lg:text-xl">
					Elig doloremque mollitia fugiat omnis! Porro facilis quo animi
					consequatur.
				</p>
				<div className="mb-16 space-y-8">
					<div className="flex items-start gap-4">
						{/* <div className="flex flex-col items-center gap-2">
							<button 
								type
								className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
								Try our product for free
							</button>
							<p className="text-muted-foreground text-xs">
								No credit card required
							</p>
						</div>
						<button className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
							Book a demo
						</button> */}
					</div>
					<div className="bg-background flex w-full items-center justify-between rounded-full px-4 py-2 shadow">
						<div className="flex items-center">
							<span className="flex items-center gap-x-0.5">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									className="lucide lucide-star fill-accent-foreground stroke-accent-foreground size-3"
								>
									<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
								</svg>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									className="lucide lucide-star fill-accent-foreground stroke-accent-foreground size-3"
								>
									<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
								</svg>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									className="lucide lucide-star fill-accent-foreground stroke-accent-foreground size-3"
								>
									<polygon points="12 2 15.09 8.`26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
								</svg>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									className="lucide lucide-star fill-accent-foreground stroke-accent-foreground size-3"
								>
									<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
								</svg>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									className="lucide lucide-star fill-accent-foreground stroke-accent-foreground size-3"
								>
									<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
								</svg>
							</span>
							<span className="ml-2 text-xs">4.8 starts</span>
						</div>
						<div className="text-xs">207 Reviews</div>
					</div>
				</div>
			</div>
			<div className="container relative -mb-48 overflow-hidden">
				<div className="border-background/40 bg-background/20 mx-auto aspect-[4/3] max-w-3xl rounded-xl border p-4">
					<img
						src="https://www.shadcnblocks.com/images/block/placeholder-1.svg"
						alt="placeholder hero"
						className="size-full rounded-md object-cover"
					/>
				</div>
			</div>
		</section>
	);
};

export default Hero12;
