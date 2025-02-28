import { getPosts, getTags } from "@/lib/ghost";
import type { Post } from "@/lib/ghost";
import { RssIcon } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { SearchAndFilter } from "./components/SearchAndFilter";

interface Tag {
	id: string;
	name: string;
	slug: string;
}

export const metadata: Metadata = {
	title: "Blog | Dokploy",
	description: "Latest news, updates, and articles from Dokploy",
};

export const revalidate = 3600; // Revalidate the data at most every hour

export default async function BlogPage({
	params: { locale },
	searchParams,
}: {
	params: { locale: string };
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const t = await getTranslations({ locale, namespace: "blog" });
	const posts = await getPosts();
	const tags = (await getTags()) as Tag[];
	const search =
		typeof searchParams.search === "string" ? searchParams.search : "";
	const selectedTag =
		typeof searchParams.tag === "string" ? searchParams.tag : "";

	const filteredPosts = posts.filter((post) => {
		const matchesSearch =
			search === "" ||
			post.title.toLowerCase().includes(search.toLowerCase()) ||
			post.excerpt.toLowerCase().includes(search.toLowerCase());

		const matchesTag =
			selectedTag === "" || post.tags?.some((tag) => tag.slug === selectedTag);

		return matchesSearch && matchesTag;
	});

	return (
		<div className="container mx-auto px-4 py-12 max-w-5xl">
			<div className="flex items-center justify-between mb-8">
				<div>
					<p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
						BLOG
					</p>
					<h1 className="text-4xl font-bold">Dokploy Latest News & Updates</h1>
				</div>
				<Link
					href="/rss.xml"
					className="text-muted-foreground hover:text-foreground"
				>
					<RssIcon className="h-5 w-5" />
				</Link>
			</div>

			<SearchAndFilter
				tags={tags}
				initialSearch={search}
				initialTag={selectedTag}
				searchPlaceholder={t("searchPlaceholder")}
				allTagsText={t("allTags")}
			/>

			{filteredPosts.length === 0 ? (
				<div className="text-center py-12 min-h-[20vh] flex items-center justify-center">
					<p className="text-xl text-muted-foreground">
						{search || selectedTag ? t("noResults") : t("noPosts")}
					</p>
				</div>
			) : (
				<div className="space-y-8">
					{filteredPosts.map((post: Post) => (
						<BlogPostCard key={post.id} post={post} locale={locale} />
					))}
				</div>
			)}
		</div>
	);
}

function BlogPostCard({ post, locale }: { post: Post; locale: string }) {
	const formattedDate = new Date(post.published_at).toLocaleDateString(locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<Link
			href={`/blog/${post.slug}`}
			className="group block hover:bg-muted p-4 rounded-lg"
		>
			<article className="flex gap-6 items-start">
				{post.feature_image && (
					<div className="relative h-32 w-48 shrink-0">
						<Image
							src={post.feature_image}
							alt={post.title}
							fill
							className="object-cover rounded-lg"
						/>
					</div>
				)}
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
									<Image
										src={post.primary_author.profile_image}
										alt={post.primary_author.name}
										fill
										className="object-cover"
									/>
								</div>
							)}
							<span>{post.primary_author?.name || "Unknown Author"}</span>
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
