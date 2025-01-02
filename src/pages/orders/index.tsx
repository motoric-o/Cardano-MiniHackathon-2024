/* eslint-disable react-hooks/exhaustive-deps */
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { CardanoWallet, useWallet, WalletContext } from "@meshsdk/react";
import {
  BlockfrostProvider,
  UTxO,
  deserializeAddress,
  serializePlutusScript,
  mConStr0,
  stringToHex,
  MeshTxBuilder,
  Asset,
} from "@meshsdk/core";
import { applyParamsToScript } from "@meshsdk/core-csl";

// Integrasi smart-contract
import contractBlueprint from "../../../aiken-workspace/plutus.json";
import { useRouter } from "next/router";
import { tree } from "next/dist/build/templates/app-page";

// Mendapatkan validator script dalam format CBOR
const scriptCbor = applyParamsToScript(
  contractBlueprint.validators[0].compiledCode,
  []
);

// Mendapatkan contract address
const contractAddress = serializePlutusScript(
  { code: scriptCbor, version: "V3" },
  undefined,
  0
).address;

// Loading environment variable blockfrost API key dan seedphrares wallet
const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || "";

// Inisiasi node provider Blockfrost
const nodeProvider = new BlockfrostProvider(blockfrostApiKey);

// Reference number sebagai Redeemer
const redeemMessage = "";

// Jeda 10 detik setelah berhasil transaksi
const timeout = 30000;

export default function Merchant() {
  const router = useRouter();
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState(true);
  const [utxoList, setUtxoList] = useState<UTxO[]>([]);
  const [orders, setOrders] = useState<Object[]>([]);
  const [token, setToken] = useState<string>('');
  const [enabled, setEnabled] = useState<boolean>(false);

  // Ketika terdeksi perubahan parameter connected yang bernilai false menjadi true maka fungsi getUtxosListContractAddr() dieksekusi
  useEffect(() => {
    setUtxoList([]);
    if (connected) {
      getCredentials();
    } else {
      router.push("/login");
      return
    }
  }, [connected]);

  async function getCredentials() {
    try {
      const response = await fetch("http://localhost:5000/api/get-orders");
      const data: any = await response.json();
      setOrders(data);
      setLoading(true);

      const clientWallet = await getWallet()
      for (let i = 0; i < data.length; i++) {
        const orderIndex: any = data[i];
        console.log(orderIndex.client, clientWallet)
        if (orderIndex.client == await clientWallet) {
          setEnabled(true);
        } else {
          setEnabled(false);
        }
      }
    } catch {
      alert('Failed to load user data');
    }
  }

  async function getWallet() {
    const w : string = await wallet.getChangeAddress();
      return w;
  }

  function onTokenInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setToken(value);
  }

  // Fungsi untuk konfirmasi bahwa barang sudah sampai dengan token yang diterima oleh client
  async function handleConfirmation(txhash: string) {
    var confirm = false;
    const updatedOrders = orders.map((item: any) => {
      if (item.txhash === txhash) {
        if (token == item.token) {
          confirm = true;
          return { ...item, status: true };
        } else {
          return { ...item };
        }
      } else {
        return { ...item };
      }
    });
    setOrders(updatedOrders);

    if (confirm) {
      try {
        const response = await fetch('http://localhost:5000/api/save-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedOrders),
        });
        const result = await response.json();
        console.log(result.message);
      } catch (error) {
        console.error('Error: ', error)
      }
      alert('Order confirmed!');
    } else {
      alert('Failed to confirm order');
    }
  }

  return (
    <div className="flex-col h-screen w-screen font-[family-name:var(--font-geist-sans)] px-5 md:px-20 justify-center items-center">
      <h1 className="text-4xl text-white font-bold mt-5 place-self-center">
        ORDERS
      </h1>

      {/* TABLE */}
      {connected && (
        <div className="mx-auto md:w-1/2 h-3/4 bg-zinc-800 rounded-xl my-5 overflow-y-auto scroll-mr-5">
          <div className="px-auto">
            {orders.length === 0 && !loading && (
              <p className="font-semibold text-lg text-white text-center mt-3">Loading...</p>
            )}
            {orders.length === 0 && loading && (
              <p className="font-semibold text-lg text-white text-center mt-3">No Orders</p>
            )}
            {orders.length > 0 && loading && (
              <div className="w-full h-full p-3 px-auto">
                {enabled && (
                  <div className="mx-auto w-full h-full flex md:flex-wrap justify-center">
                    {orders.map((item: any, index) => (
                      <div key={index} className="bg-zinc-700 w-[40%] h-auto rounded-xl m-5 p-4 px-5">
                        <div className="w-full h-full overflow-hidden">
                          <div className="text-lg text-white font-bold mb-2">Transaction ID <button className="transition ease-in-out duration-500 ml-1 hover:scale-110" onClick={() => { navigator.clipboard.writeText(item.txhash); }}><Image alt="copy" src="/copy.png" height="20" width="20"></Image></button>{item.txhash}</div>
                          <p className="text-3xl text-white font-bold mb-3">{item.amount} ₳</p>
                          <input type="text" placeholder="Insert confirmation token" className="mb-2 ml-[0.5rem] w-[93%] h-auto bg-zinc-900 text-white text-center text-sm md:text-lg p-2 rounded-xl top-[0.4rem]" onChange={onTokenInput}></input>
                          <button
                            className="transition ml-[0.5rem] w-[93%] h-auto bg-zinc-900 ease-in-out duration-500 hover:bg-zinc-600 hover:scale-105 text-white text-center p-2 font-bold rounded-xl top-[0.4rem]"
                            onClick={() => handleConfirmation(item.txhash)}
                          >
                            Confirm Transaction
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
