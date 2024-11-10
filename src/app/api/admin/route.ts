import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function isAdmin(userId:string){
    const client  = await clerkClient()
    const user = await client?.users.getUser(userId)
    return user.privateMetadata.role === 'admin'
}