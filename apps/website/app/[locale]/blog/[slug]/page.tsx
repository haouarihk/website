import { getPost, getPosts } from "@/lib/ghost";
import type { Post } from "@/lib/ghost";
import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
	params: { locale: string; slug: string };
};

export async function generateMetadata(
	{ params }: Props,
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const post = await getPost(params.slug);

	if (!post) {
		return {
			title: "Post Not Found",
		};
	}

	return {
		title: post.title,
		description: post.custom_excerpt || post.excerpt,
		openGraph: post.feature_image
			? {
					images: [
						{
							url: post.feature_image,
							width: 1200,
							height: 630,
							alt: post.title,
						},
					],
				}
			: undefined,
	};
}

export async function generateStaticParams() {
	const posts = await getPosts();

	return posts.map((post) => ({
		slug: post.slug,
	}));
}

export default async function BlogPostPage({ params }: Props) {
	const { locale, slug } = params;
	const t = await getTranslations({ locale, namespace: "blog" });
	const post = await getPost(slug);

	if (!post) {
		notFound();
	}

	const formattedDate = new Date(post.published_at).toLocaleDateString(locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<article className="container mx-auto px-4 py-12 max-w-4xl">
			<Link
				href="/blog"
				className="inline-flex items-center mb-8 text-primary hover:text-primary/80 transition-colors"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-5 w-5 mr-2"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
						clipRule="evenodd"
					/>
				</svg>
				{t("backToBlog")}
			</Link>

			<header className="mb-8">
				<h1 className="text-4xl font-bold mb-4">{post.title}</h1>
				<div className="flex items-center mb-6">
					{post.primary_author?.profile_image && (
						<div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
							<Image
								src={post.primary_author.profile_image}
								alt={post.primary_author.name}
								fill
								className="object-cover"
							/>
						</div>
					)}
					<div>
						<p className="font-medium">
							{post.primary_author?.name || "Unknown Author"}
						</p>
						<p className="text-sm text-muted-foreground">
							{formattedDate} • {post.reading_time} min read
						</p>
					</div>
				</div>
				{post.feature_image && (
					<div className="relative h-96 w-full rounded-lg overflow-hidden">
						<Image
							src={post.feature_image}
							alt={post.title}
							fill
							className="object-cover"
							priority
						/>
					</div>
				)}
			</header>

			<div
				className="prose prose-lg max-w-none prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80"
				dangerouslySetInnerHTML={{ __html: post.html }}
			/>

			{post.tags && post.tags.length > 0 && (
				<div className="mt-12 pt-6 border-t border-border">
					<h2 className="text-xl font-semibold mb-4">{t("tags")}</h2>
					<div className="flex flex-wrap gap-2">
						{post.tags.map((tag) => (
							<Link
								key={tag.id}
								href={`/blog/tag/${tag.slug}`}
								className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-full text-sm transition-colors"
							>
								{tag.name}
							</Link>
						))}
					</div>
				</div>
			)}
		</article>
	);
}
