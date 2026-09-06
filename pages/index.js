import Head from "next/head";
import HomePage from "../Components/HomePage";

export default function Home() {
  return (
    <>
      <Head>
        <title>ChainSpace — Smart Contract Studio</title>
        <meta
          name="description"
          content="A beautiful 3D Ethereum smart contract playground."
        />
        <meta name="theme-color" content="#050816" />
      </Head>
      <HomePage />
    </>
  );
}