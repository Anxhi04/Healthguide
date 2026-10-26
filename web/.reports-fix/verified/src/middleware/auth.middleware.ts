import { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import { getUserById } from "../services/user.services";
import { AccountRestrictionError, assertAccountCanMutate } from "../services/accountStatus.service";

export const authenticate=async(
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    console.log("🔐 AUTHENTICATE MIDDLEWARE: Checking authorization header");
    try{
        const authHeader=req.headers.authorization;
        if(!authHeader){
            console.log("❌ AUTHENTICATE: No authorization header");
            return res.status(401).json({
                message:"Authenticstion required"
            })
        }
        const token = authHeader.split(" ")[1];
        if(!token){
            console.log("❌ AUTHENTICATE: Invalid authorization format");
            return res.status(401).json({
                message:"Invalid authorization"
            })
        }
        console.log("🔐 AUTHENTICATE: Token found, verifying...");
        const decodenToken= await getAuth().verifyIdToken(token);
        console.log("✅ AUTHENTICATE: Token verified. UID:", decodenToken.uid);
        req.user=decodenToken;
        if (!["GET", "HEAD", "OPTIONS"].includes(req.method ?? "GET")) {
            // Fresh server data for every mutation; never trust cached token/local status.
            assertAccountCanMutate(await getUserById(decodenToken.uid));
        }
        next();
    }catch(error){
        if (error instanceof AccountRestrictionError) return res.status(error.statusCode).json({ code: error.code, message: error.message });
        console.log("❌ AUTHENTICATE ERROR:", error);
        return res.status(401).json({
            message:"Invalid or expired token"
        })
    }
}