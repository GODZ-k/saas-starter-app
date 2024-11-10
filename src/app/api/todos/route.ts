import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const ITEM_PER_PAGE = 10;

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      {
        msg: "Unauthorized access",
      },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";

  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId,
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: ITEM_PER_PAGE,
      skip: (page - 1) * ITEM_PER_PAGE,
    });

    const totalItems = await prisma.todo.count({
      where: {
        userId,
        title: {
          contains: "search",
          mode: "insensitive",
        },
      },
    });

    const totalPages = Math.ceil(totalItems / ITEM_PER_PAGE);

    return NextResponse.json(
      {
        msg: "Todo found successfully",
        todos,
        currentPage: page,
        totalPages,
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

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const {title} = await req.json();

  if (!userId) {
    return NextResponse.json(
      {
        msg: "Unauthorized access",
      },
      { status: 401 }
    );
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        todos: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          msg: "Unauthorized access",
        },
        { status: 401 }
      );
    }

    if (!user.isSubscribed) {
      if (user.todos.length >= 3) {
        return NextResponse.json({
          msg: "you have reached you free todo limit . please buy a subscription to create more",
        },{status:403});
      }
    }

    const todo = await prisma.todo.create({
        data:{
            title,      
            userId      

        }
    })

    return NextResponse.json(
      {
        msg: "Todo added successfully",
        todo,
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
