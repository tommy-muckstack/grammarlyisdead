import { currentUser } from "@/lib/session";
import { Editor } from "@/components/writing/Editor";
export default async function DocPage({ params }: { params: Promise<{ id: string }> }) { const u = (await currentUser())!; return <Editor userId={u.id} docId={(await params).id} />; }
