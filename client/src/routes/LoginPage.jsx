import { SignIn } from "@clerk/clerk-react";

export default function LoginPage () {
    return(
      <div className='flex items-center justify-center h-[calc(100vh-80px)]'>
        {/* Display a message if the user is signed in */}
        <SignIn signUpUrl="/register" />
      </div>
    )
}