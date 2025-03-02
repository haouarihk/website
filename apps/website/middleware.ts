import createMiddleware from "next-intl/middleware";

export default createMiddleware({
	locales: ["en", "fr", "zh-Hans"],
	defaultLocale: "en",
	localePrefix: "always",
	// Excluir la ruta de la API de OG images
	localeDetection: true,
});

export const config = {
	// Match only internationalized pathnames
	matcher: ["/((?!api|_next|.*\\..*).*)"],
};
