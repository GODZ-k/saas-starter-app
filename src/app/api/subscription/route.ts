import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma";


export async function POST() {
    const {userId}  = await auth()

    if(!userId){
        return NextResponse.json({
            error:"Unauthorized"
        },{status:401})
    }

    // capture payment 

    try {

        const loggedInUser = await prisma.user.findUnique({
            where:{
                id:userId
            }
        })
        
        if(!loggedInUser){
            return NextResponse.json({
                msg:"User not found",
            },{status:401})
        }


        const subscriptionEnds = new Date()

        subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1)

        const subscribe  = await prisma.user.update({
            where:{
                id:userId
            },
            data:{
                isSubscribed:true,
                subscriptionEnds

            }
        })

        return NextResponse.json({
            msg:"Subscription bought successfully",
            subscribe
        },{status:200})

    } catch (error:any) {
        return NextResponse.json({
            msg:"Internal server error",
            error
        },{status:500})
    }

    
}


export async function GET() {
    const {userId} = await auth()
    
    if(!userId){
        return NextResponse.json({
            error:"Unauthorized"
        },{status:401})
    }
    
    try {
        
        const loggedInUser = await prisma.user.findUnique({
            where:{
                id:userId
            },
            select:{
                isSubscribed:true,
                subscriptionEnds:true
            }
        })
        
        if(!loggedInUser){
            return NextResponse.json({
                msg:"User not found",
            },{status:401})
        }

        const now  = new Date()

        if(loggedInUser.subscriptionEnds && loggedInUser.subscriptionEnds < now){
            await prisma.user.update({
                where:{
                    id:userId
                },
                data:{
                    isSubscribed:false,
                    subscriptionEnds:null
                }
            })
            return NextResponse.json({
                isSubscriber:false,
                subscriptionEnds:null
            },{status:200})
        }


        return NextResponse.json({
            isSubscriber:loggedInUser.isSubscribed,
            subscriptionEnds:loggedInUser.subscriptionEnds
        },{status:200})

    } catch (err) {
        return NextResponse.json({
            error:"Internal server error",
            err,
        },{status:500})
    }
}