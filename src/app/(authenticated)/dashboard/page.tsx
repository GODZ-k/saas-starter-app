'use client';

import { useUser } from "@clerk/nextjs"
import { Todo } from "@prisma/client"
import { useCallback, useEffect, useState } from "react"
import { useDebounceValue } from "usehooks-ts"
import axios from 'axios'

function Dashboard() {
    const { user } = useUser()
    const [todos , setTodos] = useState<Todo[]>([])
    const [search , setSearch ]=  useState('')
    const [currentPage , setCurrentPage] = useState(1)
    const [todoPages , setTodoPages] = useState('')
    const [isSubscribed , setIsSubscribed]= useState(false)


    const [debouncedValue] =useDebounceValue(search,300)

    

    const fetchTodos = useCallback(async (page:number)=>{
      try {
        const response  = await axios.get(`/api/todos?page=${page}&search=${debouncedValue}`,{
          withCredentials:true
        })
        if(!response){
          throw new Error("failed to fetch todo")
        }
        const data = response.data
        console.log(data)
        setTodoPages(data.totalPages)
        setCurrentPage(data.currentPage)
        setTodos(data.todos)
        return data
      } catch (err) {
        console.log(err)
      }
    },[debouncedValue])


    useEffect(()=>{
      fetchTodos(1)
      fetchSubscriptionStatus()
    },[fetchTodos])

    const fetchSubscriptionStatus = async()=>{
      const response = await axios.get('/api/subscription',{
        withCredentials:true
      })
      if(!response){
        throw new Error(" failed to fetch subscription")
      }
      const data = response.data 
      setIsSubscribed(data.isSubscribed)
    }

    const handleAddTodo= async(title:string)=>{
      try {
        const response = await axios.post('/api/todos',{
          headers:{
            'Content-Type':'application/json'
          }
        })

        if(!response){
          throw new Error("")
        }
        await fetchTodos(currentPage)

      } catch (error) {
        console.log
      }
    }
    

    const handleUpdateTodo = async(id:string , completed:boolean) =>{
      try {
        const response = await axios.put(`/api/todos/${id}`,{
          iscompleted:true
        })

        if(!response){
          throw new Error("failed to update todo")
        }
        

        await fetchTodos(currentPage)

      } catch (error) {
        console.log(error)
      }
    }


    const handleDeleteTodo = async(id:string) =>{
      try {
        const response = await axios.delete(`/api/todos/${id}`)

        if(!response){
          throw new Error("failed to delete todo")
        }
        

        await fetchTodos(currentPage)

      } catch (error) {
        console.log(error)
      }
    }
    
    return (

    <div>
        page
    </div>
  )
}

export default Dashboard;