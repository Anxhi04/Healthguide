import { getAuth } from "firebase-admin/auth";

export const createFirebaseUser=async(
    email:string,
    password:string
)=>{
    const userRecord=await getAuth().createUser({
        email,
        password
    });
    return userRecord;
}