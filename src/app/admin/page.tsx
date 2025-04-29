"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { Trash2, UserX } from "lucide-react"

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, activeRentals: 0, totalRevenue: 0 })
  const [passwordInput, setPasswordInput] = useState("")
  const [confirmationInput, setConfirmationInput] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [pendingAction, setPendingAction] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        router.push("/auth/login")
        return
      }
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (!userDoc.exists() || !userDoc.data().isAdmin) {
          toast({ variant: "destructive", title: "Access Denied", description: "You are not an admin." })
          router.push("/")
          return
        }
        fetchUsers()
      } catch (error) {
        console.error("Error verifying admin:", error)
      }
    }
    checkAdmin()
  }, [user, router])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setUsers(data)
      setStats({ totalUsers: data.length })
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const confirmAction = (type, userId) => {
    setPendingAction({ type, userId })
    setGeneratedCode(generateRandomCode())
    setPasswordInput("")
    setConfirmationInput("")
    setErrorMessage("")
  }

  const handleSecureAction = async () => {
    if (!pendingAction) return

    if (!passwordInput || !confirmationInput) {
      setErrorMessage("Please fill all fields.")
      return
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, passwordInput)
      await reauthenticateWithCredential(auth.currentUser, credential)

      if (confirmationInput !== generatedCode) {
        setErrorMessage("Confirmation code mismatch.")
        return
      }

      if (pendingAction.type === "makeAdmin") {
        await updateDoc(doc(db, "users", pendingAction.userId), { isAdmin: true })
        setUsers(prev => prev.map(u => u.id === pendingAction.userId ? { ...u, isAdmin: true } : u))
        toast({ title: "Admin granted." })
      } else if (pendingAction.type === "removeAdmin") {
        await updateDoc(doc(db, "users", pendingAction.userId), { isAdmin: false })
        setUsers(prev => prev.map(u => u.id === pendingAction.userId ? { ...u, isAdmin: false } : u))
        toast({ title: "Admin rights removed." })
      } else if (pendingAction.type === "deleteUser") {
        await deleteDoc(doc(db, "users", pendingAction.userId))
        setUsers(prev => prev.filter(u => u.id !== pendingAction.userId))
        toast({ title: "User deleted." })
      }

      setPendingAction(null)
    } catch (error) {
      console.error("Error verifying password:", error)
      setErrorMessage("Incorrect password. Please try again.")
    }
  }

  if (loading) return <div className="text-center py-10">Loading...</div>

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="grid gap-6">
            {users.map(u => (
              <Card key={u.id}>
                <CardHeader>
                  <CardTitle>{u.name}</CardTitle>
                  <CardDescription>{u.email}</CardDescription>
                  {u.isAdmin && <Badge>Admin</Badge>}
                </CardHeader>
                <CardFooter className="flex gap-2">
                  {!u.isAdmin ? (
                    <Button variant="outline" onClick={() => confirmAction("makeAdmin", u.id)}>Make Admin</Button>
                  ) : (
                    <Button variant="outline" onClick={() => confirmAction("removeAdmin", u.id)}>Remove Admin</Button>
                  )}
                  <Button variant="destructive" onClick={() => confirmAction("deleteUser", u.id)}>Delete User</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Secure Confirmation Popup */}
      <AlertDialog open={!!pendingAction} onOpenChange={(open) => { if (!open) setPendingAction(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Sensitive Action</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your password and type the code: <strong>{generatedCode}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 mt-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <Input
              placeholder="Type confirmation code"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
            />
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSecureAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
