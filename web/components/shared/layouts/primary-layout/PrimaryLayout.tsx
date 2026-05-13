"use client";

import { ReactNode } from "react";
import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";

type LayoutProps = { children: ReactNode };

export default function PrimaryLayout({ children }: LayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex flex-1 flex-col">{children}</div>
            <Footer />
        </div>
    );
}
