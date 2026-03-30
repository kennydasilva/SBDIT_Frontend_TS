import { useState, useEffect } from "react";
import { getUserData } from "../api/authService";


interface User{
    id:number;
    email:string;
    role:string;
}

export const useAuth=()=>{
    const [user, setUser]=useState<User | null>(null);
    const [loading, setloading]=useState(true);


    useEffect(()=>{
        const UserData=getUserData();
        setUser(UserData);
        setloading(false);
    }, []);


    const isAuthenticated=()=>{
        return !!localStorage.getItem("token");
    };

    const getUserRole=()=>{
        return user?.role || null;
    };


    const getUserEmail=()=>{
        return user?.email || null;
    };

    const getUserId=() =>{
        return user?.id || null;
    };


    return {
        user,
        loading,
        isAuthenticated:isAuthenticated(),
        getUserRole,
        getUserEmail,
        getUserId,
    };
};