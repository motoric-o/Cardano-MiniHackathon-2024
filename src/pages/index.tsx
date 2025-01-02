import Image from "next/image";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  function route_login(): void {
    router.push('/login');
  }

  return (
    <div className="h-screen font-[family-name:var(--font-geist-sans)]">
      <div className="absolute flex flex-col md:flex-row inset-0 top-1/4 p-3 md:p-0 md:left-[10%]">
        <div id="scroll" className="md:mx-5 h-72 md:w-[45rem] text-wrap mt-36 z-10">
          <p className="text-8xl font-bold text-white mb-8 text-center md:text-start">Cardano Web3Tx</p>
          <p className="text-lg text-white mb-10 text-center md:text-start">
            Cardano Web3Tx is a brand new website to make Cardano cryptocurrency transactions.
            You can do anything related with Cardano Cryptocurrency, such as balance transfers, balance receiving, NFT selling, all you can do in one
            website. It's a very simple looking website, yet it fits all your needs and it is very user friendly and easy to use. To get started, it's as simple
            as connecting your dApp wallet with a browser extension!
          </p>
        </div>
        <div id="scroll" className="mx-auto md:mx-5 h-[32rem] w-[32rem] mt-32 md:mt-0">
          <Image id="img" src="/cardano.webp" alt="cardano" width={512} height={512} className="md:relative rounded-full border-8 inset-0 md:left-52" />
        </div>
      </div>
      <div className="absolute flex flex-col md:flex-row inset-0 top-[75rem] md:top-[70rem] md:left-[10%] p-3 md:p-0">
        <div id="scroll" className="mx-auto md:ml-0 md:mx-5 h-[32rem] w-[40rem] mt-32 md:mt-0">
          <Image id="anim-img" src="/eternl.png" alt="cardano" width={400} height={400} className="absolute inset-0 left-10 md:-left-10 bg-white rounded-full z-10" />
          <Image id="anim-img1" src="/lace.png" alt="cardano" width={300} height={300} className="absolute inset-0 left-80 md:left-64 top-16 bg-white rounded-full" />
        </div>
        <div id="scroll" className="md:mx-5 h-72 md:w-[45rem] text-wrap mt-96 md:mt-36 z-10">
          <p className="text-8xl font-bold text-white mb-8 text-center md:text-start">What is dApp?</p>
          <p className="text-lg text-white mb-10 pl-2 text-center md:text-start">
            A decentralized application (dApp) is a software application that runs on a blockchain or a distributed network of computers rather than relying on a single centralized server. These applications leverage the features of decentralization, transparency, and security provided by the underlying blockchain or distributed ledger technology.
            Specifically for this case, wallets such as Eternl or Lace is recommended.
          </p>
        </div>
      </div>
      <div id="scroll" className="absolute flex-row inset-0 top-[150rem] justify-center justify-items-center w-full">
        <div className="text-8xl text-white font-black mb-8 text-center"> What are you waiting for?</div>
        <button className="transition bg-zinc-900 ease-in-out duration-500 hover:bg-zinc-700 hover:scale-110 relative text-white text-center text-2xl p-1 font-bold rounded-xl w-64 h-14 top-[0.4rem]" onClick={route_login}>Get Started!</button>
      </div>
      <div className="absolute inset-0 top-[185rem] justify-center justify-content-center w-full">
        <p className="text-transparent">a</p>
      </div>
    </div>
  );
}
