"use client"

import Link from "next/link"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSignIn } from "../_hooks/use-log-in"
import { GoogleLoginButton } from "./GoogleLoginButton"
import { GoogleAuthCallbackHandler } from "./GoogleAuthCallbackHandler"

export function LoginForm() {
    const {
        form: {
            register,
            handleSubmit,
            formState: { errors },
        },
        onSubmit,
        isSubmitting,
    } = useSignIn()

    return (
        <Suspense fallback={null}>
            <GoogleAuthCallbackHandler>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-xl">

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-foreground">Email</label>
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            className="h-11 w-full mt-1 text-base font-medium text-gray-900"
                            {...register("email")}
                        />
                        {errors.email?.message && (
                            <p className="text-xs text-red-600">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground">Password</label>

                        </div>
                        <Input
                            type="password"
                            placeholder="Enter your password"
                            className="h-11 w-full mt-1 text-base text-gray-900 font-medium"
                            {...register("password")}
                        />
                        <div className="flex items-center mt-1">
                            {errors.password?.message && (
                                <p className="text-xs text-red-600">{errors.password.message}</p>
                            )}

                            <Link
                                href="/forgot-password"
                                className="ml-auto text-xs font-medium text-[#1F7AE0] hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>


                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-11 w-full rounded-lg bg-[#1F7AE0] text-white font-semibold hover:bg-[#1B6BB8] flex items-center justify-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                        {isSubmitting ? "Logging in..." : "Login"}
                    </Button>

                    <div className="text-center font-medium mt-2">
                        Don't have an account?{" "}
                        <Link href="/register" className="font-semibold text-[#1F7AE0] hover:underline">
                            Sign up
                        </Link>
                    </div>

                    <div className="flex items-center my-4">
                        <div className="grow border-t" />
                        <span className="mx-2 text-sm text-muted-foreground">Or continue with</span>
                        <div className="grow border-t" />
                    </div>

                    <GoogleLoginButton />
                </form>
            </GoogleAuthCallbackHandler>
        </Suspense>
    )
}
