import { LoginForm } from "../_components/LoginForm"

export default function LoginPage() {
    return (
        <>
            <div className="mb-8 text-center mt-20">
                <h1 className="text-3xl xl:text-[33px] font-semibold text-foreground mb-1">
                    Welcome Back!
                </h1>
                <p className="text-gray-500">
                    Enter your email and password to access your account
                </p>
            </div>

            <LoginForm />
        </>
    )
}
