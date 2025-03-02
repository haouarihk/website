"use client";

import * as xmlPlugin from "@prettier/plugin-xml";
import * as prettier from "prettier";
import { Highlight, themes } from "prism-react-renderer";
import { useEffect, useState } from "react";

interface CodeBlockProps {
	code: string;
	language: string;
	className?: string;
}

export function CodeBlock({ code, language, className = "" }: CodeBlockProps) {
	const [formattedCode, setFormattedCode] = useState(code);

	useEffect(() => {
		const formatCode = async () => {
			try {
				// Determine the parser based on the language
				let parser = language;
				let plugins: any[] = [];

				// Map common languages to their appropriate parsers
				switch (language.toLowerCase()) {
					case "tsx":
					case "ts":
					case "typescript":
						parser = "babel-ts";
						plugins = ["@babel/plugin-syntax-typescript"];
						break;
					case "jsx":
					case "js":
					case "javascript":
						parser = "babel";
						break;
					case "html":
					case "xml":
					case "svg":
						parser = "html";
						plugins = [xmlPlugin];
						break;
					case "json":
						parser = "json";
						break;
					case "css":
					case "scss":
					case "less":
						parser = "css";
						break;
					default:
						// For unknown languages, just clean up the whitespace
						setFormattedCode(code.trim());
						return;
				}

				const formatted = await prettier.format(code, {
					parser,
					plugins,
					semi: true,
					singleQuote: false,
					tabWidth: 2,
					useTabs: false,
					printWidth: 80,
				});

				setFormattedCode(formatted.trim());
			} catch (error) {
				console.warn("Error formatting code:", error);
				// If formatting fails, just clean up the whitespace
				setFormattedCode(code.trim());
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
