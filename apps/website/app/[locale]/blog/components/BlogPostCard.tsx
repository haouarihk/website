"use client";

import type { Post } from "@/lib/ghost";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
interface BlogPostCardProps {
	post: Post;
	locale: string;
}

export function BlogPostCard({ post, locale }: BlogPostCardProps) {
	const router = useRouter();
	const formattedDate = new Date(post.published_at).toLocaleDateString(locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const handleTwitterClick = (e: React.MouseEvent) => {
		if (post.primary_author?.twitter) {
			router.push(`https://twitter.com/${post.primary_author.twitter}`);
		}
		e.preventDefault();
		e.stopPropagation();
	};

	return (
		<Link
			href={`/blog/${post.slug}`}
			className="group block hover:bg-muted p-4 rounded-lg"
		>
			<article className="flex gap-6 items-start">
				<div className="relative h-32 w-48 shrink-0">
					<Image
						src={post.feature_image || "/og.png"}
						alt={post.feature_image ? post.title : "Default Image"}
						fill
						className="object-cover rounded-lg"
					/>
				</div>
				<div className="flex-1 min-w-0">
					<h2 className="text-xl font-semibold mb-2 group-hover:text-primary">
						{post.title}
					</h2>
					<p className="text-muted-foreground line-clamp-2 mb-4">
						{post.custom_excerpt || post.excerpt}
					</p>
					<div className="flex items-center text-sm text-muted-foreground">
						<div className="flex items-center">
							{post.primary_author?.profile_image && (
								<div className="relative h-6 w-6 rounded-full overflow-hidden mr-2">
									{post.primary_author.twitter ? (
										<button
											className="block cursor-pointer transition-opacity hover:opacity-90"
											onClick={handleTwitterClick}
											type="button"
										>
											<Image
												src={post.primary_author.profile_image}
												alt={post.primary_author.name}
												fill
												className="object-cover"
											/>
										</button>
									) : (
										<Image
											src={post.primary_author.profile_image}
											alt={post.primary_author.name}
											fill
											className="object-cover"
										/>
									)}
								</div>
							)}
							{post.primary_author?.twitter ? (
								<button
									className="hover:text-primary transition-colors"
									onClick={handleTwitterClick}
									type="button"
								>
									{post.primary_author.name || "Unknown Author"}
								</button>
							) : (
								<span>{post.primary_author?.name || "Unknown Author"}</span>
							)}
						</div>
						<span className="mx-2">in</span>
						<span>{post.primary_tag?.name || "General"}</span>
						<span className="mx-2">•</span>
						<span>{post.reading_time} min read</span>
						<span className="mx-2">•</span>
						<span>{formattedDate}</span>
					</div>
				</div>
			</article>
		</Link>
	);
}
