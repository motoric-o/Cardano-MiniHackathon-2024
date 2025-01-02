
/* eslint-disable react-hooks/exhaustive-deps */

// Dependencies / modules yang digunakan
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import Link from "next/link";

// Environment variable berisi nama NFT dalam format Hex dan policyID
const token1 = process.env.NEXT_PUBLIC_TOKEN_1;
const token2 = process.env.NEXT_PUBLIC_TOKEN_2;
const token3 = process.env.NEXT_PUBLIC_TOKEN_3;
const policyID = process.env.NEXT_PUBLIC_POLICY_ID;
const merchantAdd = process.env.NEXT_PUBLIC_SELLER_ADDRESS;

export default function Login() {
  const router = useRouter();
  const { connected, wallet } = useWallet();
  const [message, setMessage] = useState<null | any>(null);
  const [colorMessage, setColorMessage] = useState<boolean>(true);
  // Jika true kondisi dimana hanya ada satu button login, jika false terdapat pilihan lebih dari satu button login
  const [assetsList, setAssetsList] = useState([
    { assetName: "", fingerPrint: "", policyId: "", quantity: "", unit: "" },
  ]);
  const [merchantState, setMerchant] = useState<boolean>(false);
  const membershipTypes = ["Silver", "Gold", "Platinum"];
  let merchant = false;

  // Fungsi-fungsi di dalam useEffect akan selalu dieksekusi jika parameter connected terdapat perubahan
  useEffect(() => {
    clearStates();
    const element: any = document.getElementById("container_flex");
    // Jika Cardano Wallet berhasil terhubung periksa credential NFT
    if (connected) {
      checkCredentials();
    } else {
      element.classList.remove("expanded", "expanded_merchant", "expanded_notoken");
    }
  }, [connected]);

  // Fungsi merestart nilai dari parameter-parameter
  function clearStates() {
    setMessage(null);
    setMerchant(false);
    setAssetsList([
      { assetName: "", fingerPrint: "", policyId: "", quantity: "", unit: "" },
    ]);
  }

  // Fungsi untuk memeriksa credential NFT
  async function checkCredentials() {
    try {
      // Mendapatkan list token-token (FT / NFT) dari wallet yang terhubung
      const _assets = await wallet.getAssets();
      const address = await wallet.getChangeAddress();
      const element: any = document.getElementById("container_flex");
      const root: any = document.querySelector(':root');
      // console.log("ASSETS:", _assets);

      // Memfilter list token-token NFT yang sesuai dengan nama-nama token dan policyID yang sudah ditentukan di file environtment variable (.env)
      const filteredAsset: any = _assets.filter(
        (asset: { assetName: string; policyId: string }) =>
          (asset.assetName === token1 ||
            asset.assetName === token2 ||
            asset.assetName === token3) &&
          asset.policyId === policyID
      );
      // console.log("FILTERED ASSETS", filteredAsset);

      // Menyimpan list token-token NFT yang sudah di filter
      setAssetsList(filteredAsset);

      if (address === merchantAdd) {
        merchant = true;
        setMerchant(merchant);
      }

      root.style.setProperty('--login-button-count', (filteredAsset.length > 0 ? filteredAsset.length : (merchant ? 2 : 1)));

      // Jika tidak ada / tidak ditemukan token NFT
      if (filteredAsset.length === 0) {
        // Menampilkan notifikasi tidak bisa login karena tidak memiliki NFT
        setMessage("No Tokens Found!");
        setColorMessage(false);
        element.classList.add("expanded_notoken");
        return;
      }
      // Jika hanya ada satu token NFT
      else if (filteredAsset.length === 1) {
        // Menampilkan notifikasi selamat datang member dan diizinkan untuk bisa login
        const assetName = filteredAsset[0].assetName;
        let membershipType = "";

        // Nama token sesuai membership
        if (assetName === token1) {
          membershipType = "Silver Member";
        } else if (assetName === token2) {
          membershipType = "Gold Member";
        } else if (assetName === token3) {
          membershipType = "Platinum Member";
        }

        const text = `Welcome ${membershipType}`;
        setMessage(text);
        setColorMessage(true);

        element.classList.add((merchant == true) ? "expanded_merchant" : "expanded");
      }
      // Jika ada lebih dari satu token NFT
      else {
        // Menampilkan selamat datang dan diizinkan untuk login dengan memilih membership-nya
        setMessage("Welcome, choose your membership");
        setColorMessage(true);
        element.classList.add((merchant == true) ? "expanded_merchant" : "expanded");
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      setMessage("Error when connect wallet!");
      setColorMessage(false);
    }
  }

  // User Interface
  return (
    <div className="h-screen font-[family-name:var(--font-geist-sans)]">
      <div id="container1" className="mt-72 mx-auto w-[85%] max-h-[20rem] grid grid-rows-2 md:grid-cols-2">
        <div className="flex flex-col mt-5 mx-auto text-center md:text-start">
          <div className="text-7xl text-white font-black mb-3"> Get Started!</div>
          <div className="pl-1 text-lg text-white">Simply connect your wallet to get started!</div>
        </div>
        <div>
          <div id="container_flex" className="bg-white flex-col place-self-center w-3/5 rounded-xl p-4">
            {connected ? (
              <p className="text-center h-20 text-2xl font-black text-green-500">
                Wallet connected!
              </p>
            ) : (
              <p className="text-center h-20 text-2xl font-black text-black">
                Wallet not connected.
              </p>
            )}

            {/* Komponen Cardano Wallet */}
            <div className="flex justify-center item-center mb-8 scale-125 md:scale-[165%]">
              <CardanoWallet label="Connect your Wallet" />
            </div>

            <div>
                {colorMessage ? (
                  <p className="text-center h-10 text-black text-xl">{message}</p>
                ) : (
                  <div className="flex flex-col">
                    <p className="text-center h-10 text-red-500 text-xl">{message}</p>
                    <div className="flex justify-center items-center">
                      <Link href={{ pathname: '/dashboard', query: { membership: '' } }} className="transition bg-zinc-900 ease-in-out duration-500 hover:bg-zinc-700 hover:scale-110 text-white font-bold text-center pt-1 rounded-xl w-3/4 h-10 text-lg mb-2">
                        Login without membership
                      </Link>
                    </div>

                  </div>
                )}

                {assetsList.map((asset, index) => (
                  <div key={index} className="flex justify-center items-center">
                    <Link href={{ pathname: '/dashboard', query: { membership: membershipTypes[index] } }} className="transition bg-zinc-900 ease-in-out duration-500 hover:bg-zinc-700 hover:scale-110 text-white font-bold text-center pt-1 rounded-xl w-3/4 h-10 text-lg mb-2">
                      Login as{" "}
                      {(index === 0
                        ? "Silver Member"
                        : index === 1
                          ? "Gold Member"
                          : "Platinum Member")}
                    </Link>
                  </div>
                ))}
                {merchantState ? (
                  <div className="flex-col text-center">
                    <p className="text-black mb-2 text-xl">Or</p>
                    <div className="flex justify-center items-center text-center">
                      <Link href={{ pathname: '/merchant' }} className="relative transition bg-zinc-900 ease-in-out duration-500 hover:bg-zinc-700 hover:scale-110 text-white font-bold text-center pt-1 rounded-xl w-3/4 h-10 text-lg mb-2">
                        Login as Merchant
                      </Link>
                    </div>
                  </div>

                ) : (
                  <></>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
