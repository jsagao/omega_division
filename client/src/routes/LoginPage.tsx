import React from "react";
import { SignIn } from "@clerk/clerk-react";

const LoginPage: React.FC = () => {
    return(
      <div className='flex items-center justify-center h-[calc(100vh-80px)] bg-navy-900'>
        {/* Display a message if the user is signed in */}
        <SignIn signUpUrl="/register" />
      </div>
    );
};

export default LoginPage;
