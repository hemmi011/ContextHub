"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"


type Project = {
    id: string
    name: string
    client_name: string
    status: string
    end_date: string
}


export default function Home() {

    const router = useRouter()
    const [userName, setUserName] = useState("")
    const [projectStats, setProjectStats] = useState({active: 0, done: 0})
    const [taskStats, setTaskStats] = useState({todo: 0, inprogress: 0})
    const [recentProjects, setRecentProjects] = useState<Project[]>([])


    useEffect(() => {

        const init = async () => {
            const {data: getUser} = await supabase.auth.getUser()
                if(!getUser.user) {
                    router.push("/login")
                    return
                }

            const {data: userInfo} = await supabase
                .from("users").select("name").eq("id",getUser.user).single()
                if(userInfo) setUserName(userInfo.name)

            const {data: project} = await supabase
                .from("projects")
                .select("id, name, client_name, status, end_date")
                .order("created_at", {ascending:false})

                if(project) {
                    setProjectStats ({
                        active: project.filter((p) => p.status === "進行中").length,
                        done: project.filter((p) => p.status === "完了").length,
                    })
                
                    setRecentProjects(project.slice(0, 5))
                }
                    


                const {data: task} = await supabase
                    .from("tasks")
                    .select("id, title, status")
                    .order("created_at", {ascending:false})

                if(task) {
                    setTaskStats({
                        todo: task.filter((t) => t.status === "未着手").length,
                        inprogress: task.filter((t) => t.status === "進行中").length,
                    })
                }

        }
        init()
    }, [])


    return (
        <>
        
            <div style={{padding: 40}}>

                <div>
                    <p>{userName}</p>さん、こんちは
                    <p>案件とタスクの概要</p>
                </div>

                <div>
                    <p>案件数：{projectStats.active + projectStats.done}</p>
                    <p>進行中：{projectStats.active}</p>
                    <p>完了：{projectStats.done}</p>
                </div>

                <div>
                    <p>タスク数：{taskStats.todo + taskStats.inprogress}</p>
                    <p>未着手：{taskStats.todo}</p>
                    <p>進行中：{taskStats.inprogress}</p>
                </div>


                <div style={{margin:10}}>
                    <div>
                        <p>直近の案件</p>
                        <Link href={"/projects"} style={{color: "red"}}>一覧へ</Link>
                    </div>

                    {recentProjects.length === 0 ? (
                        <p>案件がありません</p>
                    ) : (
                        <div>
                            {recentProjects.map((projects) => (
                                <Link key={projects.id} href={`/projects/${projects.id}`}>
                                    <span>{projects.name}</span>
                                    <span>{projects.client_name}</span>
                                    <span>{projects.status}</span>
                                    <span>
                                        {projects.end_date && (
                                            <span>{new Date(projects.end_date).toLocaleDateString("ja-JP")}</span>
                                        )}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}


                </div>
                

            </div>
        
        
        </>
    )

}