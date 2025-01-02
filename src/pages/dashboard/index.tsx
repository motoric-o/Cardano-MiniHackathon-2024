import { useWallet } from "@meshsdk/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Dashboard() {
  const { connected } = useWallet();
  const params = useSearchParams();
  const router = useRouter();

  const membership = params.get("membership");

  useEffect(() => {
    if (!connected) {
      router.push("/login");
      return
    }
  }, [connected]);

  return (
    <div className="flex-col h-screen font-[family-name:var(--font-geist-sans)] px-20 py-10 overflow-y-auto">
      <div className="mx-auto mt-4 w-3/4 h-auto">
        {membership == '' ? (
          <h1 className="text-4xl text-white font-bold mb-20">
            Welcome!
          </h1>
        ) : (
          <h1 className="text-4xl text-white font-bold mb-20">
            Welcome {membership} Member!
          </h1>
        )}
        <div className="w-full h-full flex flex-col md:flex-row gap-10">
          <Link href="/marketplace" className="transition ease-in-out duration-500 relative bg-zinc-800 hover:scale-105 rounded-xl w-96 h-52 p-6 text-white overflow-hidden">
            <div className="flex mb-3">
              <p className="font-bold text-3xl pr-4">MARKETPLACE</p>
              <Image alt="marketplace" height="45" width="45" src="/marketplace.png" className="relative inset-0 -top-2" />
            </div>
            <p className="text-zinc-300">This is where your shopping begins. Explore the vast Cardano marketplace here.</p>
          </Link>
          <Link href="/marketplace" className="transition ease-in-out duration-500 relative bg-zinc-800 hover:scale-105 rounded-xl w-96 h-52 p-6 text-white overflow-hidden">
            <div className="flex mb-3">
              <p className="font-bold text-3xl pr-4">TRANSACTION</p>
              <Image alt="marketplace" height="40" width="40" src="/cardano.webp" />
            </div>
            <p className="text-zinc-300">Send or receive funds from other wallets here.</p>
          </Link>
          <Link href="/orders" className="transition ease-in-out duration-500 relative bg-zinc-800 hover:scale-105 rounded-xl w-96 h-52 p-6 text-white overflow-hidden">
            <div className="flex mb-3">
              <p className="font-bold text-3xl pr-4">HISTORY</p>
              <Image alt="marketplace" height="512" width="512" src="/history.png" className="w-[35px] h-[35px]" />
            </div>
            <p className="text-zinc-300">Track all your transactions and items that you order here.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
