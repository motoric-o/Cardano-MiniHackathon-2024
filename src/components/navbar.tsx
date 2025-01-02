import Link from "next/link";
import { useWallet } from "@meshsdk/react";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Navbar() {
    const { connected, wallet, name, disconnect } = useWallet();
    const [address, setAddress] = useState<string>("");
    const [profileState, setProfileState] = useState<number>(1);
    const [walletPic, setWalletPic] = useState<string>('/blank.png');

    useEffect(() => {
        if (connected) {
            getAddress();
            setWalletPic(`/${name}.png`);
        }
    }, [connected]);

    async function getAddress() {
        const value = await wallet.getChangeAddress();
        setAddress(value);
    }

    function onAddressClick() {
        if (connected) {
            navigator.clipboard.writeText(address);
        }
    }

    return (
        <div className="flex flex-col md:flex-row md:h-28 h-40 justify-between pt-10 px-4 md:px-64 pb-4 text-white z-20 font-[family-name:var(--font-geist-sans)] border-b-4 border-double border-zinc-700">
            {connected ? (
                <Link href="/dashboard" className="relative mr-5 flex-none text-4xl font-bold top-1">Cardano Web3Tx</Link>
            ) : (
                <a className="relative mr-5 flex-none text-4xl font-bold top-1" href="/">Cardano Web3Tx</a>
            )}
            <div className="h-16 flex gap-5 mt-3 md:mt-0 md:justify-end text-xl">
                <a className="p-3" href="">About</a>
                <a className="p-3" href="">Support</a>
                {connected ? (
                    <div id="profile" className="bg-white relative text-black overflow-hidden z-30">
                        <div className="flex-row h-full w-full overflow-hidden">
                            <div className="flex">
                                <Image src={walletPic} alt="profile" width="40" height="40" className="max-h-[40px] max-w-[40px]"></Image>
                                <div className="ml-2 mt-1 max-h-7 overflow-hidden">{name} Wallet</div>
                            </div>
                            <div>
                                <p className="text-zinc-500 text-lg mt-1 ml-2">Address: </p>
                                <button className="transition-colors ease-in-out duration-200 h-10 w-full md:w-[23.25rem] px-3 ml-1 mt-1 rounded-lg bg-zinc-300 hover:bg-zinc-400 overflow-hidden" onClick={onAddressClick}>{address}</button>
                                <button className="transition-colors ease-in-out duration-200 h-10 w-full md:w-[23.25rem] px-3 ml-1 mt-2 rounded-lg bg-red-500 hover:bg-red-800 text-white overflow-hidden" onClick={disconnect}>Disconnect Wallet</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <a href="/login" className="transition bg-zinc-900 ease-in-out duration-500 hover:bg-zinc-700 hover:scale-110 relative text-white text-center p-1 font-bold rounded-xl w-32 h-10 top-[0.4rem]">Log In</a>
                )}
            </div>
        </div>
    );
}