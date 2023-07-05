import React, { ReactElement } from "react"
import Head from "next/head"
import { AppProps } from "next/app"
import "assets/styles.scss"

const App = ({ Component, pageProps }: AppProps): ReactElement => {
  return (
    <>
      <>
        <Head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
          />
          <title>めうめう語生成機</title>
        </Head>
        <Component {...pageProps} />
      </>
    </>
  )
}

export default App
