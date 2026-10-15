import { currentUser } from "@/lib/session";
import { Dashboard } from "@/components/writing/Dashboard";
export default async function AppHome() { const u = (await currentUser())!; return <Dashboard userId={u.id} />; }
