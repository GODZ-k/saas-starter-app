import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

const secret = process.env.CLERK_WEBHOOK_SECRET as string;


export async function POST(req:Request){
    const headerPayload  = headers()
    const svix_id = (await headerPayload).get('svix-id')
    const svix_timestamp = (await headerPayload).get('svix-timestamp')
    const svix_signature = (await headerPayload).get('svix-signature')

    if(!svix_id || !svix_signature || !svix_timestamp){
        return  new Response("Error accored")
    }
   
    const payload = await req.json();
    const body = JSON.stringify(payload)

    const wh = new Webhook(secret);
    // Throws on error, returns the verified content on success
    let evt:WebhookEvent 
    try {
        evt = wh.verify(body,{
            "svix-id":svix_id,
            "svix-signature":svix_signature,
            "svix-timestamp":svix_timestamp
        }) as WebhookEvent
    } catch (error) {
        console.error(" error verifying the webhook",error)
        return new Response("error accour" , {status:422})
    }

    const eventType = evt.type
    
    if(eventType === 'user.created'){
        const newUser  = await prisma.user.create({
            data: {
                email:evt.data.primary_email_address_id!,
                isSubscribed:false,
            },
        })

        console.log("No primary email address" ,  newUser)
    }

    return new Response("webhook recieved successfully")
}
