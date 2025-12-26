import type React from "react"
import type { Metadata } from "next"
import Image from "next/image"
import { clsx } from "clsx"
import logo from "@/public/logo.svg"
import vector from "../assets/vector.png"
import image from "../assets/image_bg_1.png"
import image2 from "../assets/image_bg_2.png"

export const metadata: Metadata = {
    title: "Login - Vaidya.ai",
    description: "Login to your Vaidya.ai account",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
            <div className="flex flex-col px-6 py-5 sm:px-12 lg:px-8 col-span-5">
                <div className="w-full h-full flex flex-col gap-9">
                    <div className="inline-flex items-center">
                        <Image src={logo} width={64} height={64} alt="Vaidya logo" />
                        <span className="text-3xl font-bold text-foreground ml-1">Vaidya.ai</span>
                    </div>

                    <div className="flex flex-col items-center justify-center w-full">
                        {children}
                    </div>
                </div>
            </div>

            <div
                className={clsx(
                    "hidden relative",
                    "lg:flex col-span-7",
                    "2xl:ml-4 2xl:mr-6 mr-4 my-5 xl:mr-4 pt-8 px-4",
                    "rounded-2xl",
                    "bg-linear-to-br from-[#1F7AE0] to-[#0c54a0]",
                    "overflow-hidden"
                )}
            >
                <Image
                    src={vector}
                    alt=""
                    fill
                    className="object-cover opacity-20 pointer-events-none z-0"
                />

                <div className="lg:mt-35 xl:mt-22 2xl:mt-16 mx-6 lg:mx-10 2xl:mx-12">
                    <p className="text-gray-200 text-2xl lg:text-3xl xl:text-4xl 2xl:text-[42px] leading-tight font-semibold">
                        Effortlessly manage your personal health
                    </p>
                    <p className="text-[#d4d4d4] text-lg lg:text-xl mt-2">
                        Log in to access your Vaidya dashboard and manage your health
                    </p>

                    <div className="relative w-full mt-8 max-w-4xl">
                        <Image
                            src={image}
                            alt="Image 1"
                            width={1920}
                            height={1080}
                            className="relative z-10 w-full h-auto object-contain rounded-2xl"
                        />

                        <Image
                            src={image2}
                            alt="Image 2"
                            width={1920}
                            height={1080}
                            className={clsx(
                                "absolute top-2 z-20",
                                "2xl:w-85 h-auto md:w-60 xl:w-72",
                                "rounded-2xl",
                                "-right-14 2xl:-right-20"
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
