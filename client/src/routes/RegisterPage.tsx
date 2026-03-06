import React from "react";
import { SignUp } from "@clerk/clerk-react";

const RegisterPage: React.FC = () => {
    return (
        <div className='flex items-center justify-center h-[calc(100vh - 80px)] bg-navy-900'>
        {/* Display a message if the user is signed in */}
        <SignUp signInUrl="/login"/>

        </div>
    );
};

export default RegisterPage;
