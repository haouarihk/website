"use client";
import React, { type CSSProperties } from "react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

interface RippleProps {
	mainCircleSize?: number;
	mainCircleOpacity?: number;
	numCircles?: number;
	className?: string;
}

const Ripple = React.memo(function Ripple({
	mainCircleSize = 210,
	mainCircleOpacity = 0.24,
	numCircles = 8,
	className,
}: RippleProps) {
	const avatarsFirstRing = [
		"https://github.com/shadcn.png", // URLs de los avatares del primer aro
		"https://github.com/shadcn.png",
		"https://github.com/shadcn.png",
		"https://github.com/shadcn.png",
		"https://github.com/shadcn.png",
	];
	const avatarsSecondRing = [
		"https://github.com/shadcn.png", // URLs de los avatares del segundo aro
		"https://github.com/shadcn.png",
		"https://github.com/shadcn.png",
		"https://github.com/shadcn.png",
		"https://github.com/shadcn.png",
		"https://github.com/shadcn.png",
	];

	const avatarsThirdRing = [
		"https://github.com/shadcn.png", // URLs de los avatares del tercer aro
		"https://github.com/shadcn.png",
		"https://github.com/shadcn.png",
		"https://github.com/shadcn.png",
		"https://github.com/shadcn.png",
		"https://github.com/shadcn.png",
		"https://github.com/shadcn.png",
		"https://github.com/shadcn.png",
	];

	return (
		<div
			className={cn(
				// "pointer-events-none select-none absolute inset-0 [mask-image:linear-gradient(to_bottom,white,transparent)]",
				className,
			)}
		>
			<div>
				{Array.from({ length: numCircles }, (_, i) => {
					const size = mainCircleSize + i * 70;
					const opacity = mainCircleOpacity - i * 0.03;
					const animationDelay = `${i * 0.06}s`;
					const borderStyle = i === numCircles - 1 ? "dashed" : "solid";
					const borderOpacity = 5 + i * 5;

					return (
						<div
							key={i}
							className={`absolute animate-ripple rounded-full bg-foreground/25 shadow-xl border [--i:${i}]`}
							style={{
								width: `${size}px`,
								height: `${size}px`,
								opacity,
								animationDelay,
								borderStyle,
								borderWidth: "1px",
								borderColor: `hsl(var(--foreground), ${borderOpacity / 100})`,
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%) scale(1)",
							}}
						>
							{i === 0 && (
								<div className="relative w-full h-full flex justify-center items-center">
									{avatarsFirstRing.map((src, index) => {
										const angle = (360 / avatarsFirstRing.length) * index;
										const radius = mainCircleSize / 2;
										const x = radius * Math.cos((angle * Math.PI) / 180);
										const y = radius * Math.sin((angle * Math.PI) / 180);

										return (
											<div
												key={index}
												className="absolute"
												style={{
													top: "50%",
													left: "50%",
													transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
												}}
											>
												<Avatar>
													<AvatarImage src={src} />
													<AvatarFallback>CN</AvatarFallback>
												</Avatar>
											</div>
										);
									})}
								</div>
							)}

							{i === 1 && (
								<div className="relative w-full h-full flex justify-center items-center">
									{avatarsSecondRing.map((src, index) => {
										const angle = (360 / avatarsSecondRing.length) * index;
										const radius = mainCircleSize / 2 + 70; // Radio mayor para el segundo aro
										const x = radius * Math.cos((angle * Math.PI) / 180);
										const y = radius * Math.sin((angle * Math.PI) / 180);

										return (
											<div
												key={index}
												className="absolute"
												style={{
													top: "50%",
													left: "50%",
													transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
												}}
											>
												<Avatar>
													<AvatarImage src={src} />
													<AvatarFallback>CN</AvatarFallback>
												</Avatar>
											</div>
										);
									})}
								</div>
							)}

							{i === 3 && (
								<div className="relative w-full h-full flex justify-center items-center">
									{avatarsThirdRing.map((src, index) => {
										const angle = (360 / avatarsThirdRing.length) * index;
										const radius = mainCircleSize / 2 + 140; // Radio mayor para el tercer aro
										const x = radius * Math.cos((angle * Math.PI) / 180);
										const y = radius * Math.sin((angle * Math.PI) / 180);

										return (
											<div
												key={index}
												className="absolute"
												style={{
													top: "50%",
													left: "50%",
													transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
												}}
											>
												<Avatar>
													<AvatarImage src={src} />
													<AvatarFallback>CN</AvatarFallback>
												</Avatar>
											</div>
										);
									})}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
});

Ripple.displayName = "Ripple";

export default Ripple;
