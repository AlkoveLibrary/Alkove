import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/layout/favicon/favicon.ico" sizes="any" />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/layout/favicon/icon0.svg"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/layout/favicon/icon1.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/layout/favicon/apple-icon.png"
        />
        <link rel="manifest" href="/layout/favicon/manifest.json" />
        <meta name="apple-mobile-web-app-title" content="Alkove" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
