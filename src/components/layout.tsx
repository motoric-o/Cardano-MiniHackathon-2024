import { useWallet } from "@meshsdk/react";
import Navbar from "./navbar";

export default function Layout({ children }: any) {
    return (
        <>
            <div className="overflow-hidden">
                <Navbar />
                <main>{children}</main>
            </div>
        </>
    );
}