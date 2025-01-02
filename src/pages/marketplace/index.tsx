/* eslint-disable react-hooks/exhaustive-deps */

// Dependencies / modules yang digunakan
import { useEffect, useState } from "react";
import Image from "next/image";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import {
  BlockfrostProvider,
  deserializeAddress,
  serializePlutusScript,
  mConStr0,
  MeshTxBuilder,
  Asset,
  AssetMetadata,
} from "@meshsdk/core";
import { applyParamsToScript } from "@meshsdk/core-csl";

// Integrasi smart-contract
import contractBlueprint from "../../../aiken-workspace/plutus.json";
import { useRouter } from "next/router";
import { count } from "console";

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
// Loading environment variable blockfrost API key
const blockfrostApiKey = process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || "";
const merchantAddress = process.env.NEXT_PUBLIC_SELLER_ADDRESS || "";

// Inisialisasi node provider Blockfrost
const nodeProvider = new BlockfrostProvider(blockfrostApiKey);

// Mendapatkan pubKeyHash dari wallet address merchant
const signerHash = deserializeAddress(merchantAddress).pubKeyHash;

// Menentukan harga produk dan fee
const platformFee = 1;
const deliveryFee = 3;


export default function Marketplace() {
  // Initial states
  const { connected, wallet } = useWallet();
  const router = useRouter();
  const [view, setView] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cart, setCart] = useState<Object[]>([]);
  const [buttonState, setButtonState] = useState<boolean>(true);
  const [Items, setItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<Object[]>([]);

  useEffect(() => {
    if (!connected) {
      router.push("/login");
      return;
    }
    fetchOrder();
    fetchItems();
  }, [connected]);

  // Fetch database item yang tersedia di marketplace
  async function fetchItems() {
    const response = await fetch("http://localhost:5000/api/get-items");
    const data: any = await response.json();
    setItems(data);
  }

  // Fetch database order atau transaksi
  async function fetchOrder() {
    const response = await fetch("http://localhost:5000/api/get-orders");
    const data: any = await response.json();
    setOrders(data);
  }

  // Fungsi generate token random yang akan diterima oleh client
  function generateToken(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$&';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  // Fungsi untuk memasukkan transaksi ke database transaksi yang ongoing
  async function addToOrder(hash: string, walletAddress: string) {
    const tokenToFinish: string = generateToken(10);

    var updatedOrders = orders;

    const newItem = { txhash: hash, status: false, amount: totalPrice, token: tokenToFinish, client: walletAddress };
    updatedOrders.push(newItem);

    setOrders(updatedOrders);

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
  }


  // Fungsi mengembalikan parameter-parameter ke nilai semula
  function clearStates() {
    setView(1);
    setButtonState(true);
    setTotalPrice(0);
    setCart([]);
  }

  // Fungsi membaca informasi wallet
  async function getWalletInfo() {
    const walletAddress = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();
    return { walletAddress, utxos };
  }

  async function txHandler() {
    try {
      // Menghitung total harga

      // Menentukan jumlah aset yang akan di kunci
      const lovelaceAmount = (totalPrice * 1000000).toString();
      var assets: Asset[] = [{ unit: "lovelace", quantity: lovelaceAmount }];

      // Mendapatkan wallet address dan index utxo
      const { walletAddress, utxos } = await getWalletInfo();

      // Membuat draft transaksi
      const txBuild = new MeshTxBuilder({
        fetcher: nodeProvider,
        evaluator: nodeProvider,
        verbose: true,
      });

      const txDraft = await txBuild
        .setNetwork("preprod")
        .txOut(contractAddress, assets)
        .txOutDatumHashValue(mConStr0([signerHash]))
        .changeAddress(walletAddress)
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
      alert(`Transaction successful : ${txHash_}`);

      // Barang masuk ongoing order 
      addToOrder(txHash_, walletAddress);

      clearStates();
      return;
    } catch (error) {
      // Error handling jika transaksi gagal
      alert(`Transaction failed ${error}`);
      clearStates();
      return;
    }
  }

  function countTotal(updatedCart: Object[]) {
    var totalPrice = 0;
    for (let i = 0; i < updatedCart.length; i++) {
      const obj: any = updatedCart[i];
      totalPrice = totalPrice + (obj.price * obj.quantity);
    }
    if (totalPrice === 0) {
      return 0;
    } else {
      return totalPrice + platformFee + deliveryFee;
    }
  }

  // Fungsi untuk menghitung harga total
  function checkoutHandler() {
    const newTotal = countTotal(cart);
    setTotalPrice(newTotal);
    setView(2);
    setButtonState(false);
  }

  function addToCart(event: any) {
    const param = event.target.value;
    const q_element: any = document.getElementById(`${param}_qty`);
    var price = 0;

    for (let i = 0; i < Items.length; i++) {
      const obj: any = Items[i];
      if (obj.name === param) {
        price = obj.price;
      }
    }

    var addItem = true;
    const updatedCart = cart.map((item: any) => {
      if (item.name === param) {
        addItem = false;
        const newQuantity = item.quantity + parseInt(q_element.textContent);
        return { ...item, quantity: newQuantity };
      } else {
        return { ...item };
      }
    });

    if (addItem) {
      const newItem = { name: param, quantity: parseInt(q_element.textContent), price: price };
      updatedCart.push(newItem);
    }

    setCart(updatedCart);
  }

  function quantityChange(event: any) {
    const param = event.target.value;
    const q_element: any = document.getElementById(`${param}_qty`);

    if (view === 1) {
      if (event.target.textContent === '+') {
        q_element.textContent = parseInt(q_element.textContent) + 1;
      } else {
        q_element.textContent = Math.max(1, parseInt(q_element.textContent) - 1);
      }
    } else {
      const updatedCart = cart.map((item: any) => {
        if (item.name === param) {
          const newQuantity = event.target.textContent === '+'
            ? item.quantity + 1
            : Math.max(1, item.quantity - 1);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });


      const newTotal = countTotal(updatedCart);
      setCart(updatedCart);
      setTotalPrice(newTotal);
    }
  }

  function removeItem(event: any) {
    const param = event.target.value;

    var updatedCart = cart;
    for (let i = 0; i < cart.length; i++) {
      const itemIndex: any = cart[i];
      if (itemIndex.name === param) {
        updatedCart.splice(i, 1);
        break;
      } else {

      }
    }

    const newTotal = countTotal(updatedCart);
    setCart(updatedCart);
    setTotalPrice(newTotal);
  }

  function returnToMarketplace() {
    setButtonState(true);
    setView(1);
  }

  return (
    <div>
      {Items && (
        <div className="text-white font-[family-name:var(--font-geist-sans)] overflow-y-auto">
          <div className="px-40 pt-10 flex flex-col md:flex-row mb-10 justify-between">
            <p className="font-bold text-5xl mb-5 mx-auto md:mx-0">MARKETPLACE</p>
            {buttonState ? (
              <button className="transition duration-500 bg-yellow-500 p-2 mt-3 md:mr-[6.1rem] rounded-xl w-52 h-10 text-black font-bold hover:bg-yellow-600 hover:scale-105 mx-auto md:mx-0" onClick={checkoutHandler}>Checkout</button>
            ) : (
              <button className="transition duration-500 bg-yellow-500 p-2 mt-3 md:mr-[6.1rem] rounded-xl w-52 h-10 text-black font-bold hover:bg-yellow-600 hover:scale-105 mx-auto md:mx-0" onClick={returnToMarketplace}>Return to Marketplace</button>
            )}
          </div>
          {connected && view === 1 && (
            <div className="w-[95%] mx-auto justify-center align-center grid grid-cols-1 md:grid-cols-3 gap-3 overflow-hidden">
              {Items.map((product: any, index) => (
                <div key={index} className="flex h-64 bg-zinc-800 p-6 rounded-3xl justify-start gap-3">
                  <Image
                    src={`/${product.name}.png`}
                    alt="merchandise"
                    width={200}
                    height={200}
                    className="rounded-xl w-[200px] h-[200px]"
                  />
                  <div className="flex flex-col justify-between">
                    <h1 className="text-yellow-500 text-xl font-bold">
                      {product.name}
                    </h1>
                    <p id={`${product.name}_price`} className="text-xl font-bold">{product.price} ₳</p>
                    <p>Product Description :</p>
                    <p className="text-wrap md:overflow-y-auto">
                      {product.description}
                    </p>
                    <div className="flex justify-start items-center gap-6 pt-3">
                      <div className="w-28 h-8 flex justify-center items-center">
                        <button
                          onClick={quantityChange}
                          value={product.name}
                          className="transition duration-500 w-8 bg-yellow-500 text-black font-bold rounded-l-md hover:bg-yellow-600"
                        >
                          -
                        </button>
                        <span id={`${product.name}_qty`} className="w-8 text-center bg-gray-200 text-black flex justify-center items-center">
                          1
                        </span>
                        <button
                          onClick={quantityChange}
                          value={product.name}
                          className="transition duration-500 w-8 bg-yellow-500 text-black font-bold rounded-r-md hover:bg-yellow-600"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={addToCart}
                        value={product.name}
                        className="transition duration-500 bg-yellow-500 py-1 rounded-xl w-52 text-black font-semibold hover:bg-yellow-600 hover:scale-105"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {connected && view === 2 && (
            <div className="flex flex-col md:flex-row place-self-center justify-between bg-zinc-800 w-[90%] md:w-[55%] h-[40rem] rounded-xl p-8">
              <div className="w-[100%] md:w-[60%] md:h-full overflow-y-auto">
                {(cart.length > 0) && (
                  <div>
                    {cart.map((product: any, index) => (
                      <div key={index} className="flex flex-row bg-zinc-700 h-28 w-[95%] mb-5 rounded-xl p-4 justify-start gap-5 overflow-visible">
                        <button className="my-auto transition rounded-full duration-500 hover:scale-110 text-xl text-red-500 text-center py-auto font-bold bg-white w-12 h-12 -mr-5 ml-2" onClick={removeItem} value={product.name}>X</button>
                        <div className="flex flex-col ml-5">
                          <p className="text-xl text-white font-bold">{product.name}</p>
                          <p>{product.price} ₳</p>
                          <div className="-ml-2 w-28 h-8 flex justify-center items-center">
                            <button
                              onClick={quantityChange}
                              value={product.name}
                              className="transition duration-500 w-8 bg-yellow-500 text-black font-bold rounded-l-md hover:bg-yellow-600"
                            >
                              -
                            </button>
                            <span id={`${product.name}_qty`} className="w-8 text-center bg-gray-200 text-black flex justify-center items-center">
                              {product.quantity}
                            </span>
                            <button
                              onClick={quantityChange}
                              value={product.name}
                              className="transition duration-500 w-8 bg-yellow-500 text-black font-bold rounded-r-md hover:bg-yellow-600"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <Image
                          src={`/${product.name}.png`}
                          alt="merchandise"
                          width={200}
                          height={200}
                          className="rounded-xl w-[80px] h-[80px] self-center ml-auto"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <hr className="w-[100%] md:w-[0.1rem] h-[0.1rem] md:h-[100%] my-5 md:my-auto rounded-full bg-white"></hr>
              <div className="w-[100%] md:w-[30%] h-[70%] md:h-full flex flex-col justify-between">
                <p className="text-white font-bold text-3xl mb-3">Items</p>
                <div className="h-[75%] w-full px-9 py-3 place-self-center items-center justify-center bg-zinc-700 rounded-xl overflow-y-scroll">
                  <ul className="list-disc">
                    {cart && (
                      <div>
                        {cart.map((product: any, index) => (
                          <li key={index}>
                            {product.name}
                            <p>{product.quantity} x {product.price} ₳ = {product.quantity * product.price} ₳</p>
                          </li>
                        ))}
                      </div>
                    )}
                  </ul>
                </div>
                <div className="flex flex-col gap-1 mt-5 md:mt-20 mb-5">
                  <p>Subtotal: {Math.max(0, totalPrice - platformFee - deliveryFee)} ₳</p>
                  <p>Platform Fee: {platformFee} ₳</p>
                  <p>Delivery Fee: {deliveryFee} ₳</p>
                  <hr className="h-[0.1rem] w-full bg-white rounded-full"></hr>
                  <p>Total Price: {totalPrice} ₳</p>
                </div>
                <button
                  onClick={txHandler}
                  className="transition duration-500 bg-yellow-500 py-1 rounded-xl w-full text-black font-semibold hover:scale-105 hover:bg-yellow-600 mb-4"
                >
                  Pay Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
