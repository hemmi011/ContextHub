"use clint"

import { supabase } from "@/lib/supabase"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"

type Project = {
    id: string
    name: string
    client_name: string
    status: string
    end_date: string
}

export default function Home() {
    const router = useRouter()
    const [projectStats, setProjectStats] = useState({active:0, done:0})

    useEffect(() => {
        const init = async () => {
            const {data: projects} = await supabase
                .from("project")
                .select("id, name, client_name, status, end_date")
                .order("created_at", {ascending:false})

                if (projects) {
                    setProjectStats({
                        active: projects.filter((p) => p.status === "進行中").length,
                        done: projects.filter((p) => p.status === "完了").length,
                    })
                }

        }   

        init()
    }, [])

    return (
        <div>
            <p>案件数:{projectStats.active + projectStats.done}</p>
            <p>進行中：{projectStats.active}</p>
            <p>完了:{projectStats.done}</p>
        </div>
    )


}