"use client";

import Image from "next/image";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";

interface ZoomableImageProps {
	src: string;
	alt: string;
	className?: string;
}

export function ZoomableImage({ src, alt, className }: ZoomableImageProps) {
	return (
		<PhotoProvider>
			<PhotoView src={src}>
				<Image
					src={src}
					alt={alt}
					fill
					className={`object-cover cursor-zoom-in ${className || ""}`}
				/>
			</PhotoView>
		</PhotoProvider>
	);
}
