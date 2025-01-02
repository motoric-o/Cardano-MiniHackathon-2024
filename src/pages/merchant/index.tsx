/* eslint-disable react-hooks/exhaustive-deps */
import Image from "next/image";
import { useState, useEffect } from "react";
import { CardanoWallet, useWallet } from "@meshsdk/react";
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

// Jeda 10 detik setelah berhasil transaksi
const timeout = 30000;

export default function Merchant() {
  const router = useRouter();
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState(true);
  const [utxoList, setUtxoList] = useState<UTxO[]>([]);
  const [orders, setOrders] = useState<[]>([]);

  // Ketika terdeksi perubahan parameter connected yang bernilai false menjadi true maka fungsi getUtxosListContractAddr() dieksekusi
  useEffect(() => {
    setUtxoList([]);
    if (connected) {
      getUtxosListContractAddr();
      getOrders();
    } else {
      router.push("/login");
      return
    }
  }, [connected]);

  // Fungsi untuk mendapatkan list UTxO dari contract address
  async function getUtxosListContractAddr() {
    const utxos: UTxO[] = await nodeProvider.fetchAddressUTxOs(contractAddress);
    setUtxoList(utxos);
    console.log(utxos);
  }

  // Fungsi fetch database order atau transaksi
  async function getOrders() {
    const response = await fetch("http://localhost:5000/api/get-orders");
    const data: any = await response.json();
    setOrders(data);

    setLoading(true);
  }

  // Fungsi membaca informasi wallet
  async function getWalletInfo() {
    const walletAddress = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();
    const collateral = (await wallet.getCollateral())[0];
    return { walletAddress, utxos, collateral };
  }

  async function handleTx(
    txHash: string,
    index: number,
    amount: Asset[],
    address: string
  ) {
    getOrders();
    var redeemMessage = '';
    var status = false;

    var updatedOrders = orders;
    var index = 0;
    for (let i = 0; i < updatedOrders.length; i++) {
      const orderIndex: any = updatedOrders[i];
      if (orderIndex.txhash == txHash) {
        status = orderIndex.status;
        break;
      }
    }

    if (status) {
      updatedOrders.splice(index, 1);
      setOrders(updatedOrders);
      redeemMessage = 'received';
    }

    try {
      // Mendapatkan alamat wallet, list utxo, dan kolateral dari wallet address penerima dana
      const { walletAddress, utxos, collateral } = await getWalletInfo();

      // Mendapatkan pubKeyHash sebagai bukti (datum) bahwa wallet address ini berhak menerima dana
      const signerHash = deserializeAddress(walletAddress).pubKeyHash;

      // Membuat draft transaksi
      const txBuild = new MeshTxBuilder({
        fetcher: nodeProvider,
        evaluator: nodeProvider,
        verbose: true,
      });
      const txDraft = await txBuild
        .setNetwork("preprod")
        .spendingPlutusScript("V3")
        .txIn(txHash, index, amount, address)
        .txInScript(scriptCbor)
        .txInRedeemerValue(mConStr0([stringToHex(redeemMessage)]))
        .txInDatumValue(mConStr0([signerHash]))
        .requiredSignerHash(signerHash)
        .changeAddress(walletAddress)
        .txInCollateral(
          collateral.input.txHash,
          collateral.input.outputIndex,
          collateral.output.amount,
          collateral.output.address
        )
        .selectUtxosFrom(utxos)
        .complete();

      // Menandatangani transaksi
      let signedTx;
      try {
        signedTx = await wallet.signTx(txDraft);
      } catch (error) {
        return;
      }

      // Submit transaksi dan mendapatkan transaksi hash
      const txHash_ = await wallet.submitTx(signedTx);
      setLoading(false);
      setUtxoList([]);

      // Jeda, setelah berhasil transaksi lalu muat ulang list UTxO dari contract address
      setTimeout(() => {
        alert(`Transaction successful : ${txHash_}`);
        getUtxosListContractAddr();
        setLoading(true);
      }, timeout);

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

      return;
    } catch (error) {
      // Error handling jika transaksi gagal
      alert(`Transaction failed ${error}`);
      return;
    }
  }

  return (
    <div className="flex-col h-screen font-[family-name:var(--font-geist-sans)] px-20 justify-center items-center">
      <h1 className="text-4xl text-white font-bold mt-5 place-self-center">
        MERCHANT PAYOUT
      </h1>

      {/* TABLE */}
      {connected && (
        <div className="mx-auto md:w-1/2 h-3/4 bg-zinc-800 rounded-xl my-5 overflow-y-auto scroll-mr-5">
          <div className="px-auto">
            {utxoList.length === 0 && !loading && (
              <p className="font-semibold text-lg text-white text-center mt-3">Loading...</p>
            )}
            {utxoList.length === 0 && loading && (
              <p className="font-semibold text-lg text-white text-center mt-3">No Funds</p>
            )}
            {utxoList.length > 0 && loading && (
              <div className="w-full h-full p-3 px-auto">
                <div className="mx-auto w-full h-full flex md:flex-wrap justify-center">
                  {utxoList.map((utxo, index) => (
                    <div key={index} className="bg-zinc-700 w-[40%] h-auto rounded-xl m-5 p-4 px-5">
                      <div className="w-full h-full overflow-hidden">
                        <div className="text-lg text-white font-bold mb-2">Transaction ID <button className="transition ease-in-out duration-500 ml-1 hover:scale-110" onClick={() => { navigator.clipboard.writeText(utxo.input.txHash); }}><Image alt="copy" src="/copy.png" height="20" width="20"></Image></button>{utxo.input.txHash}</div>
                        <p className="text-3xl text-white font-bold mb-6">{Number(utxo.output.amount[0].quantity) / 1_000_000} ₳</p>
                        <button
                          className="transition ml-[0.5rem] w-[93%] h-auto bg-zinc-900 ease-in-out duration-500 hover:bg-zinc-600 hover:scale-105 text-white text-center p-2 font-bold rounded-xl top-[0.4rem]"
                          onClick={() =>
                            handleTx(
                              utxo.input.txHash,
                              utxo.input.outputIndex,
                              utxo.output.amount,
                              utxo.output.address
                            )
                          }
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
