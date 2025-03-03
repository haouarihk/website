import { CopyButton } from "@/components/ui/copy-button";
import prettier from "prettier";
import { codeToHtml } from "shiki";
import type { BundledLanguage } from "shiki/bundle/web";

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

export async function CodeBlock(props: LanguageProps) {
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
