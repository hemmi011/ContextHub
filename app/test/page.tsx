"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"


    type Project = {
        id: string
        name: string
        client_name: string
        status: string
        end_date: string
    }

    type Task = {
        id: string
        name: string
        status: string
    }

export default function Home() {
    const router = useRouter()
    const [projectStats, setProjectStats] = useState({active: 0, done: 0})
    const [tasksStats, setTasksStats] = useState({todo: 0, inProgress: 0})


    useEffect(() => {
        const init = async () => {

            const {data: projects} = await supabase
                .from("projects")
                .select("id, name, client_name, status, end_date")
                .order("created_at", {ascending: false})

            if (projects) {
                setProjectStats({
                    active: projects.filter((p) => p.status === "進行中").length,
                    done: projects.filter((p) => p.status === "完了").length,
                })
            }


            const {data: tasks} = await supabase
                .from("tasks")
                .select("id, title, status")
                .order("created_at", {ascending:false})

            if (tasks) {
                setTasksStats({
                    todo: tasks.filter((t) => t.status === "未着手").length,    // (t)は今取り出した１つをtとよぶ。tのstatusが未着手か確認
                    inProgress: tasks.filter((t) => t.status === "完了").length,
                })
            }
        }

        init()
    }, [])


  return (
    <div style={{padding: 40}}>
        <div style={{backgroundColor: "#ffe8e8ff", border: "1px solid #6984ffff", borderRadius: 20 , width: "20%", padding: 10}}>
            <p>案件数：{projectStats.active + projectStats.done}件</p>
            <p>進行中：{projectStats.active}</p>
            <p>完了：{projectStats.done}</p>
        </div>

        <div>
            <p>タスク数：{tasksStats.todo + tasksStats.inProgress}件</p>
            <p>未着手：{tasksStats.todo}</p>
            <p>完了：{tasksStats.inProgress}</p>
        </div>

    </div>

  )
}