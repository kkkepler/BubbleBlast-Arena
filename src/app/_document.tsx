import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
return (
<Html lang="ru">
  <Head>
    <link rel="icon" href="data:;base64,=" />
  </Head>
  <body className="bg-background text-foreground">
    <Main />
    <NextScript />
  </body>
</Html>
);
}
