import { CopyButton } from "@/components/ui/copy-button";
import { getPost, getPosts } from "@/lib/ghost";
import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as prettier from "prettier";
import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type React from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { codeToHtml } from "shiki";
import type { BundledLanguage } from "shiki/bundle/web";
import TurndownService from "turndown";
// @ts-ignore
import * as turndownPluginGfm from "turndown-plugin-gfm";
import { ZoomableImage } from "./components/ZoomableImage";

type Props = {
	params: { locale: string; slug: string };
};

export async function generateMetadata(
	{ params }: Props,
	parent: ResolvingMetadata,
): Promise<Metadata> {
	const { locale, slug } = await params;
	const post = await getPost(slug);

	if (!post) {
		return {
			title: "Post Not Found",
		};
	}

	const ogUrl = new URL(
		`/${locale}/api/og`,
		process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
	);
	ogUrl.searchParams.set("slug", slug);

	return {
		title: post.title,
		description: post.custom_excerpt || post.excerpt,
		openGraph: {
			title: post.title,
			description: post.custom_excerpt || post.excerpt,
			type: "article",
			url: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${post.slug}`,
			images: [
				{
					url: ogUrl.toString(),
					width: 1200,
					height: 630,
					alt: post.title,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: post.title,
			description: post.custom_excerpt || post.excerpt,
			images: [ogUrl.toString()],
		},
	};
}

export async function generateStaticParams() {
	const posts = await getPosts();
	const locales = ["en", "fr", "zh-Hans"];

	return posts.flatMap((post) =>
		locales.map((locale) => ({
			locale,
			slug: post.slug,
		})),
	);
}

interface CodeProps
	extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
	inline?: boolean;
	className?: string;
	children?: React.ReactNode;
}
interface LanguageProps {
	children: string;
	lang: BundledLanguage;
}

const getParserForLanguage = (language: string): string => {
	const languageMap: { [key: string]: string } = {
		js: "babel",
		jsx: "babel",
		ts: "typescript",
		tsx: "typescript",
		json: "json",
		css: "css",
		scss: "scss",
		less: "less",
		html: "html",
		xml: "xml",
		markdown: "markdown",
		md: "markdown",
		yaml: "yaml",
		yml: "yaml",
	};

	return languageMap[language.toLowerCase()] || "babel";
};

async function CodeBlock(props: LanguageProps) {
	const format = await prettier.format(props.children, {
		semi: true,
		singleQuote: true,
		tabWidth: 2,
		useTabs: false,
		printWidth: 120,
		parser: getParserForLanguage(props.lang),
	});
	const out = await codeToHtml(format, {
		lang: props.lang,
		theme: "houston",
	});

	return (
		<div className="group relative">
			<CopyButton text={format} />
			<div
				dangerouslySetInnerHTML={{ __html: out }}
				className="text-sm p-4 rounded-lg bg-[#18191F] overflow-auto"
			/>
		</div>
	);
}
export default async function BlogPostPage({ params }: Props) {
	const { locale, slug } = await params;
	// setRequestLocale(locale);
	const t = await getTranslations({ locale, namespace: "blog" });
	const post = await getPost(slug);
	const allPosts = await getPosts();

	// Get related posts (excluding current post)
	const relatedPosts = allPosts.filter((p) => p.id !== post?.id).slice(0, 3); // Show only 3 related posts

	if (!post) {
		notFound();
	}

	// Convertir HTML a Markdown
	const turndownService = new TurndownService({
		headingStyle: "atx",
		codeBlockStyle: "fenced",
	});
	const gfm = turndownPluginGfm.gfm;
	const tables = turndownPluginGfm.tables;
	const strikethrough = turndownPluginGfm.strikethrough;
	turndownService.use([tables, strikethrough, gfm]);

	const markdown = turndownService.turndown(post.html);

	const formattedDate = new Date(post.published_at).toLocaleDateString(locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const components: Partial<Components> = {
		h1: ({ node, ...props }) => (
			<h1
				className="text-xl md:text-2xl xl:text-3xl text-primary font-bold mt-8 mb-4"
				{...props}
			/>
		),
		h2: ({ node, ...props }) => (
			<h2 className="text-2xl text-primary/90 font-bold mt-6 mb-3" {...props} />
		),
		h3: ({ node, ...props }) => (
			<h3 className="text-xl text-primary/90 font-bold mt-4 mb-2" {...props} />
		),
		p: ({ node, children, ...props }) => {
			return (
				<p
					className="text-base text-muted-foreground leading-relaxed mb-4"
					{...props}
				>
					{children}
				</p>
			);
		},
		a: ({ node, href, ...props }) => (
			<a
				href={href}
				className="text-blue-500 hover:text-blue-500/80 transition-colors"
				target="_blank"
				rel="noopener noreferrer"
				{...props}
			/>
		),
		ul: ({ node, ...props }) => (
			<ul className="list-disc list-inside space-y-2 mb-4" {...props} />
		),
		ol: ({ node, ...props }) => (
			<ol className="list-decimal list-inside space-y-2 mb-4" {...props} />
		),
		li: ({ node, ...props }) => (
			<li className="text-base leading-relaxed" {...props} />
		),
		blockquote: ({ node, ...props }) => (
			<blockquote
				className="border-l-4 border-primary pl-4 py-2 my-4 bg-muted/50"
				{...props}
			/>
		),
		table: ({ node, ...props }) => (
			<div className="my-6 w-full overflow-x-auto border rounded-lg">
				<table className="w-full border-collapse" {...props} />
			</div>
		),
		thead: ({ node, ...props }) => (
			<thead className="bg-muted border-b border-border" {...props} />
		),
		tbody: ({ node, ...props }) => (
			<tbody className="divide-y divide-border" {...props} />
		),
		tr: ({ node, ...props }) => (
			<tr className="transition-colors hover:bg-muted/50" {...props} />
		),
		th: ({ node, ...props }) => (
			<th className="p-4 text-left font-semibold" {...props} />
		),
		td: ({ node, ...props }) => (
			<td className="p-4 text-muted-foreground" {...props} />
		),
		img: ({ node, src, alt }) => (
			<ZoomableImage
				src={src || ""}
				alt={alt || ""}
				className="object-cover max-w-lg mx-auto rounded-lg border max-lg:w-64 border-border overflow-hidden"
			/>
		),
		code: ({ inline, className, children, ...props }: CodeProps) => {
			const match = /language-(\w+)/.exec(className || "");

			return (
				<CodeBlock lang={match ? (match[1] as BundledLanguage) : "ts"}>
					{children?.toString() || ""}
				</CodeBlock>
			);
		},
	};

	return (
		<article className="container mx-auto px-4 pb-12 max-w-5xl">
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

			<div className=" rounded-lg p-8 shadow-lg border border-border">
				<header className="mb-8">
					<h1 className="text-xl md:text-2xl xl:text-3xl font-bold mb-4">
						{post.title}
					</h1>
					<div className="flex items-center mb-6">
						{post.primary_author?.profile_image && (
							<div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
								{post.primary_author.twitter ? (
									<a
										href={`https://twitter.com/${post.primary_author.twitter}`}
										target="_blank"
										rel="noopener noreferrer"
										className="block cursor-pointer transition-opacity hover:opacity-90"
									>
										<Image
											src={post.primary_author.profile_image}
											alt={post.primary_author.name}
											fill
											className="object-cover"
										/>
									</a>
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
						<div>
							<p className="font-medium">
								{post.primary_author?.twitter ? (
									<a
										href={`https://twitter.com/${post.primary_author.twitter}`}
										target="_blank"
										rel="noopener noreferrer"
										className="hover:text-primary transition-colors"
									>
										{post.primary_author.name || "Unknown Author"}
									</a>
								) : (
									post.primary_author?.name || "Unknown Author"
								)}
							</p>
							<p className="text-sm text-muted-foreground">
								{formattedDate} • {post.reading_time} min read
							</p>
						</div>
					</div>
					{post.feature_image && (
						<div className="relative w-full  h-[400px] mb-8">
							<ZoomableImage
								src={post.feature_image}
								alt={post.title}
								className="rounded-lg h-full w-full object-cover"
							/>
						</div>
					)}
				</header>

				<div className="prose prose-lg max-w-none">
					<ReactMarkdown
						remarkPlugins={[remarkGfm]}
						rehypePlugins={[rehypeRaw]}
						components={components}
					>
						{markdown}
					</ReactMarkdown>
				</div>

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
			</div>

			{relatedPosts.length > 0 && (
				<div className="mt-12">
					<h2 className="text-2xl font-bold mb-6">{t("relatedPosts")}</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{relatedPosts.map((relatedPost) => {
							const relatedPostDate = new Date(
								relatedPost.published_at,
							).toLocaleDateString(locale, {
								year: "numeric",
								month: "long",
								day: "numeric",
							});

							return (
								<Link
									key={relatedPost.id}
									href={`/blog/${relatedPost.slug}`}
									className="group"
								>
									<div className="bg-card rounded-lg overflow-hidden h-full shadow-lg transition-all duration-300 hover:shadow-xl border border-border">
										{relatedPost.feature_image && (
											<div className="relative h-48 w-full">
												<Image
													src={relatedPost.feature_image}
													alt={relatedPost.title}
													fill
													className="object-cover"
												/>
											</div>
										)}
										<div className="p-6">
											<h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
												{relatedPost.title}
											</h3>
											<p className="text-sm text-muted-foreground mb-4">
												{relatedPostDate} • {relatedPost.reading_time} min read
											</p>
											<p className="text-muted-foreground line-clamp-2">
												{relatedPost.excerpt}
											</p>
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				</div>
			)}
		</article>
	);
}
