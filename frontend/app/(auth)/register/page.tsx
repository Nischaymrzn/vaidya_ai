import { SignupForm } from "../_components/SignupForm"

export default function SignupPage() {
    return (
        <>
            <div className="mb-4 text-center mt-4">
                <h1 className="text-3xl xl:text-[33px] font-semibold mb-1">
                    Let’s get started
                </h1>
                <p className="text-gray-500">
                    Enter your details to create an account and get started.
                </p>
            </div>

            <SignupForm />
        </>
    )
}
