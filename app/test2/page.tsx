"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Project = {
    id: string
    name: string
    client_nama: string
    status: string
    end_date: string
}

export default function Home () {

    const router = useRouter()
    const [userName, setUserName] = useState("")
    const [projectStats, setProjectStats] = useState({active: 0, done: 0})
    const [taskStats, setTaskStatus] = useState({todo: 0, inProgress: 0})

    useEffect(() => {

        const init = async () => {
            const {data: getUser}  = await supabase.auth.getUser()
                if(!getUser.user) {
                    router.push("/login")
                    return
                }

            const {data: projects} = await supabase
                .from("projects")
                .select("name, client_name, status, end_date")
                .order("created_at", {ascending: false})

                if(projects) {
                    setProjectStats({
                        active: projects.filter((p) => p.status === "進行中").length ,
                        done: projects.filter((p) => p.status === "完了").length ,
                    })
                }

            const {data: tasks} = await supabase
                .from("tasks")  
                .select("id, title, status")
                .order("created_at", {ascending:false})


                if(tasks) {
                    setTaskStatus({
                        todo: tasks.filter((t) => t.status === "進行中").length,
                        inProgress: tasks.filter((t) => t.status === "未着手").length,
                    })
                }

                const {data: UserInfo} = await supabase
                    .from("users")
                    .select("name")
                    .eq("id",getUser.user.id).single()
                    if (UserInfo) setUserName(UserInfo.name)
            }

        init()
    }, [])

    return (
        <>
            <div style={{padding: 30}}>

                <div>
                    <p>{userName}さん、ようこそ</p>
                </div>

                <div>
                    <p>案件数：{projectStats.active + projectStats.done}</p>
                    <p>進行中：{projectStats.active}</p>
                    <p>完了：{projectStats.done}</p>
                </div>

                <div>
                    <p>タスク数：{taskStats.todo + taskStats.inProgress}</p>
                    <p>未着手：{taskStats.inProgress}</p>
                    <p>進行中：{taskStats.todo}</p>
                </div>

            </div>
        
        </>
    )



}