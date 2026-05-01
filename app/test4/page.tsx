"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

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

            // ログインの確認。できてたら、/loginに飛ばして、できなかったらreturnでとめる (me)
            // 未ログインの場合は/loginにリダイレクトして処理を止める
            const {data: getUser} = await supabase.auth.getUser()
                if(!getUser.user) {
                    router.push("/login")
                    return
                }
            
            //supabseからusersを選択して、nameを取得してください。idがgetUser.userと同じ場合は一つだけ取得してください。
            //もしuserInfoにある場合は、setUserNameに格納してuserInfo.nameを取得してください。 (me)
            // ログイン中のユーザーのnameをusersテーブルから取得してuserNameに保存する
            const {data: userInfo} = await supabase
                .from("users")
                .select("name")
                .eq("id",getUser.user.id).single()
                if(userInfo) setUserName(userInfo.name)

            
            // projectsテーブルからid,name,client_name, status, end_dateを取得
            const {data: project} = await supabase
                .from("projects")
                .select("id, name, client_name, status, end_date")
                .order("created_at", {ascending:false})

            // データがprojectsにある場合、setProjectStatsに保存する。ステータスが進行中、完了と同じだった場合、lengthで数を表示。
                if(project) {
                    setProjectStats({
                        active: project.filter((p) => p.status === "進行中").length,
                        done: project.filter((p) => p.status === "完了").length,
                    })


                // setRecentProjectsにprojectのデータを最新５件保存
                    setRecentProjects(project.slice(0, 5))
                }

                // projectと同じ。
            const {data: task} = await supabase
                .from("tasks").select("id, title, status")
                if(task) {
                    setTaskStats({
                        todo: task.filter((t) => t.status === "未着手").length,
                        inprogress: task.filter((t) => t.status === "進行中").length,
                    })
                }

        }

        init()
    }, [])

    return(

        <>
        
            <div style={{padding: 40}}>
                    {/* userNameで表示 */}
                <p>こんにちは、あるいはこんばんは、エージェント{userName}さん</p>

                <div>
                    <p>直近の案件</p>
                    <Link href={"/projects"}>一覧を見る</Link>
                </div>

                <div>
                    {/* recentProjectsの数が０のときは案件がありませんを表示。三項演算子 */}
                    {recentProjects.length === 0 ? (
                        <div>
                            <p>案件はありません</p>
                        </div>
                    ) : (
                        // ある場合は一覧を表示
                        <div>
                            {/* mapで配列を１つずつ表示。recentProject配列にある要素をmapメソッドを使用して１つずつ表示 */}
                            {recentProjects.map((project) => (
                                <div>
                                    <span>{project.name}</span>
                                    <span>{project.client_name}</span>
                                    <span>{project.status}</span>
                                    <span>
                                        {/* 日本語の日付で表示 */}
                                        {project.end_date && (
                                            <p>{new Date(project.end_date).toLocaleDateString("ja-JP")}</p>
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        
        </>



    )



}