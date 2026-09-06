import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ProfileForm from "./ProfileForm"

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        <p className="text-gray-500 text-sm">Update your account email and password.</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border max-w-2xl">
        <ProfileForm initialEmail={session.user.email || ""} />
      </div>
    </div>
  )
}
