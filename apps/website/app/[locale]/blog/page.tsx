import { getPosts } from "@/lib/ghost";
import type { Post } from "@/lib/ghost";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Blog | Dokploy",
	description: "Latest news, updates, and articles from Dokploy",
};

export const revalidate = 3600; // Revalidate the data at most every hour

export default async function BlogPage({
	params: { locale },
}: {
	params: { locale: string };
}) {
	const t = await getTranslations({ locale, namespace: "blog" });
	const posts = await getPosts();

	return (
		<div className="container mx-auto px-4 py-12">
			<h1 className="text-4xl font-bold mb-8">{t("title")}</h1>

			{posts.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-xl text-gray-600 dark:text-gray-400">
						{t("noPosts")}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{posts.map((post: Post) => (
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
		<Link href={`/blog/${post.slug}`} className="group">
			<div className="bg-card rounded-lg overflow-hidden h-fit shadow-lg transition-all duration-300 hover:shadow-xl border border-border">
				{post.feature_image && (
					<div className="relative h-48 w-full">
						<Image
							src={post.feature_image}
							alt={post.title}
							fill
							className="object-cover"
						/>
					</div>
				)}
				<div className="p-6">
					<h2 className="text-xl font-semibold mb-2 transition-colors">
						{post.title}
					</h2>
					<p className="text-sm  text-muted-foreground mb-4">
						{formattedDate} • {post.reading_time} min read
					</p>
					<p className=" text-primary/80 line-clamp-3 mb-4">
						{post.custom_excerpt || post.excerpt}
					</p>
					<div className="flex items-center">
						{post.primary_author?.profile_image && (
							<div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
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
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}
