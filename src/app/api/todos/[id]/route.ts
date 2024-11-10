import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";


export async function DELETE(req: NextRequest , {params}:{params:{id:string}}) {
    const { userId } = await auth();

  
    if (!userId) {
      return NextResponse.json(
        {
          msg: "Unauthorized access",
        },
        { status: 401 }
      );
    }
    try {

        const todoId = params.id
     
        const todo = await prisma.todo.findUnique({
            where:{
                id:todoId
            }
        })

        if(!todo){
        return NextResponse.json({
            msg:"Todo not found"
        },{status:404})
        }

        if(todo.userId !== userId){
            return NextResponse.json({
                msg:"You are not authorize to do this task"
            },{status:422})
        }

        await prisma.todo.delete({
            where:{
                id:todoId
            }
        })
  
      return NextResponse.json(
        {
          msg: "Todo deleted successfully",
        },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          msg: "Internal server error",
          error,
        },
        { status: 500 }
      );
    }
}


export async function PUT(req: NextRequest , {params}:{params:{id:string}}) {
    const { userId } = await auth();

  
    if (!userId) {
      return NextResponse.json(
        {
          msg: "Unauthorized access",
        },
        { status: 401 }
      );
    }
    try {

        const todoId = params.id
     
        const todo = await prisma.todo.findUnique({
            where:{
                id:todoId
            }
        })

        if(!todo){
        return NextResponse.json({
            msg:"Todo not found"
        },{status:404})
        }

        if(todo.userId !== userId){
            return NextResponse.json({
                msg:"You are not authorize to do this task"
            },{status:422})
        }

        if(todo.isCompleted){
            return NextResponse.json({
                msg:"Todo already completed"
            },{status:400})
        }

        await prisma.todo.update({
            where:{
                id:todoId
            },
            data:{
                isCompleted:true
            }
        })
  
      return NextResponse.json(
        {
          msg: "Todo updated successfully",
        },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          msg: "Internal server error",
          error,
        },
        { status: 500 }
      );
    }
}
  