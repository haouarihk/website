"use client";

import * as prettier from "prettier";
import * as prettierPluginBabel from "prettier/plugins/babel";
import * as prettierPluginEstree from "prettier/plugins/estree";
import { Highlight, themes } from "prism-react-renderer";
import { useEffect, useState } from "react";

interface CodeBlockProps {
	code: string;
	language: string;
	className?: string;
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

export function CodeBlock({ code, language, className = "" }: CodeBlockProps) {
	const [formattedCode, setFormattedCode] = useState(code);

	useEffect(() => {
		const formatCode = async () => {
			try {
				const parser = getParserForLanguage(language);

				// Eliminar espacios en blanco al inicio y final, pero mantener la indentación interna

				const formatted = await prettier.format(formattedCode, {
					semi: true,
					singleQuote: false,
					tabWidth: 2,
					useTabs: false,
					printWidth: 80,
					parser,
					plugins: [prettierPluginBabel, prettierPluginEstree],
				});

				setFormattedCode(formatted);
			} catch (error) {
				console.warn("Error formatting code:", error);
				// Si falla el formateo, al menos limpiamos los espacios en blanco extra
				const cleanCode = code.replace(/^\s+|\s+$/g, "");
				setFormattedCode(cleanCode);
			}
		};

		formatCode();
	}, [code, language]);

	return (
		<Highlight
			theme={themes.dracula}
			code={formattedCode}
			language={language.toLowerCase()}
		>
			{({
				className: preClassName,
				style,
				tokens,
				getLineProps,
				getTokenProps,
			}) => (
				<div
					className={`${preClassName} ${className} overflow-x-auto p-4 rounded-lg text-[14px] leading-[1.5] font-mono relative group`}
					style={{
						...style,
					}}
				>
					<div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
						<button
							type="button"
							onClick={() => {
								navigator.clipboard.writeText(formattedCode);
							}}
							className="px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
						>
							Copy
						</button>
					</div>
					{tokens.map((line, i) => (
						<div key={i} {...getLineProps({ line })} className="table-row">
							<span
								className="table-cell text-right pr-4 select-none w-[2.5em] text-zinc-500 text-xs"
								style={{
									color: "rgb(98, 114, 164)", // Dracula comment color
								}}
							>
								{i + 1}
							</span>
							<span className="table-cell">
								{line.map((token, key) => (
									<span key={key} {...getTokenProps({ token })} />
								))}
							</span>
						</div>
					))}
				</div>
			)}
		</Highlight>
	);
}
