import { Providers } from "components/Providers";
import type { AppProps } from "next/app";
import { ErrorBoundary } from "components/ErrorBoundary";
import { dmSans, dmSerif } from "theme/fonts";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <main className={`${dmSans.variable} ${dmSerif.variable}`}>
        <Providers>
          <Component {...pageProps} />
        </Providers>
      </main>
    </ErrorBoundary>
  );
}
