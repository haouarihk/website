import { getPosts } from "@/lib/ghost";
import { NextResponse } from "next/server";

export async function GET() {
	const posts = await getPosts();

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
	<channel>
		<title>Dokploy Blog</title>
		<link>https://dokploy.com/blog</link>
		<description>Stories behind the magic</description>
		<language>en</language>
		<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
		${posts
			.map(
				(post) => `
		<item>
			<title><![CDATA[${post.title}]]></title>
			<link>https://dokploy.com/blog/${post.slug}</link>
			<guid>https://dokploy.com/blog/${post.slug}</guid>
			<description><![CDATA[${post.excerpt}]]></description>
			<pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
			${
				post.feature_image
					? `<enclosure url="${post.feature_image}" type="image/jpeg" />`
					: ""
			}
			${
				post.primary_author
					? `<dc:creator><![CDATA[${post.primary_author.name}]]></dc:creator>`
					: ""
			}
		</item>`,
			)
			.join("\n")}
	</channel>
</rss>`;

	return new NextResponse(rss, {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "s-maxage=3600, stale-while-revalidate",
		},
	});
}
