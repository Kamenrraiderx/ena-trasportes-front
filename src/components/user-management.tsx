'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { useNotification } from './notification'
type User = {
    id: string
    Name: string
    Phone: string
    sendDate: string
    activeSend: boolean
}

const API_URL = 'https://whatsappserver-2.onrender.com/v1' // Replace with your actual API URL

export default function UserManagement() {
    const { showNotification } = useNotification()



    const hoy = new Date();

    // Obtener las partes de la fecha
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // El mes empieza desde 0, por eso sumamos 1
    const dia = String(hoy.getDate()).padStart(2, '0');
    const horas = String(hoy.getHours()).padStart(2, '0');
    const minutos = String(hoy.getMinutes()).padStart(2, '0');

    // Formatear la fecha en el formato deseado
    const globalDate = `${anio}-${mes}-${dia}T${horas}:${minutos}`;


    const [users, setUsers] = useState<User[]>([])
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isAddingUser, setIsAddingUser] = useState<boolean>(false)
    const [newUser, setNewUser] = useState<User>({
        id: '',
        Name: '',
        Phone: '',
        sendDate: '',
        activeSend: true
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/getAll`)
            if (!response.ok) throw new Error('Failed to fetch users')
            const data = await response.json()
            setUsers(data.users)
            console.log("Mis usuarios ", data.users)
        } catch (error) {
            console.log(error)
            toast({
                title: "Error",
                description: "Failed to fetch users",
                variant: "destructive",
            })
        }
    }

    const fetchMessages = async (messageType:string) => {
        try {
            console.log(messageType)
            const response = await fetch(`${API_URL}/${messageType}`)
            if (!response.ok) throw new Error('Failed to fetch messages')
            const data = await response.json()
            console.log("Mensaje respuesta", data)
        } catch (error) {
            console.log(error)
            toast({
                title: "Error",
                description: "Failed to fetch messages",
                variant: "destructive",
            })
        }
    }

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value)
    }
    console.log(users)
    const filteredUsers = users.filter(user =>
        user.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.Phone.includes(searchTerm)
    )


    const handleToggleActiveSend = async (userId: string, newValue: boolean) => {
        try {
            const response = await fetch(`${API_URL}/update-row/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activeSend: newValue })
            })
            if (!response.ok) throw new Error('Failed to update user')
            setUsers(users.map(user => user.id === userId ? { ...user, activeSend: newValue } : user))
            toast({
                title: "Success",
                description: "User updated successfully",
            })
        } catch (error) {
            console.log(error)
            toast({
                title: "Error",
                description: "Failed to update user",
                variant: "destructive",
            })
        }
    }

    const handleDeleteUser = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/delete-row/${id}`, {
                method: 'DELETE'
            })
            if (!response.ok) throw new Error('Failed to delete user')
            setUsers(users.filter(user => user.id !== id))
            toast({
                title: "Success",
                description: "User deleted successfully",
            })
        } catch (error) {
            console.log(error)
            toast({
                title: "Error",
                description: "Failed to delete user",
                variant: "destructive",
            })
        }
    }

    const handleAddUser = async () => {
        // if (users.some(user => user.Phone === newUser.Phone)) {
        //     toast({
        //         title: "Error",
        //         description: "Phone number already exists",
        //         variant: "destructive",
        //     })
        //     return
        // }

        try {
            const response = await fetch(`${API_URL}/add-row`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newUser, sendDate: globalDate })
            })
            if (!response.ok) throw new Error('Failed to add user')
            const addedUser = await response.json()
            console.log(addedUser.user)
            setUsers([...users, addedUser.user])
            setIsAddingUser(false)
            setNewUser({
                id: '',
                Name: '',
                Phone: '',
                sendDate: '',
                activeSend: true
            })
            showNotification('add', 'Listo')
            toast({
                title: "Success",
                description: "User added successfully",
            })
        } catch (error) {
            console.log(error)
            toast({
                title: "Error",
                description: "Failed to add user",
                variant: "destructive",
            })
        }
    }

    const handleUpdateUser = async (updatedUser: User) => {
        try {
            const response = await fetch(`${API_URL}/update-row/${updatedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedUser)
            })
            if (!response.ok) throw new Error('Failed to update user')
            setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user))
            setSelectedUser(null)
            toast({
                title: "Success",
                description: "User updated successfully",
            })
        } catch (error) {
            console.log(error)
            toast({
                title: "Error",
                description: "Failed to update user",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Ficha de pago</h1>



            <div className="mb-4">
                <Input
                    type="text"
                    placeholder="Buscar por nombre o numero teléfonico"
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>

                        <TableHead>Pagó</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.map((user, key) => (
                        <TableRow key={key}>
                            <TableCell>{user.Name}</TableCell>
                            <TableCell>
                                <Switch
                                    checked={!user.activeSend}
                                    onCheckedChange={(checked) => handleToggleActiveSend(user.id, !checked)}
                                />
                            </TableCell>
                            <TableCell>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" onClick={() => setSelectedUser(user)}>Editar</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Editar contacto</DialogTitle>
                                        </DialogHeader>
                                        {selectedUser && (
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="name">Nombre</Label>
                                                    <Input
                                                        id="name"
                                                        value={selectedUser.Name}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, Name: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="phoneNumber">Número teléfonico</Label>
                                                    <Input
                                                        id="phoneNumber"
                                                        value={selectedUser.Phone}
                                                        onChange={(e) => setSelectedUser({ ...selectedUser, Phone: e.target.value })}
                                                    />
                                                </div>
                                                <div className='flex justify-between'>
                                                    <Button onClick={() => handleUpdateUser(selectedUser)}>Guardar Cambios</Button>
                                                    <Button variant="destructive" onClick={() => handleDeleteUser(user.id)}>Borrar</Button>

                                                </div>
                                            </div>
                                        )}
                                    </DialogContent>
                                </Dialog>

                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
                <DialogTrigger asChild>
                    <Button className="mt-4">Agregar nuevo contácto</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar nuevo contácto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="newName">Nombre</Label>
                            <Input
                                id="newName"
                                value={newUser.Name}
                                onChange={(e) => setNewUser({ ...newUser, Name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="newPhoneNumber">Número télefonico</Label>
                            <Input
                                id="newPhoneNumber"
                                value={newUser.Phone}
                                onChange={(e) => setNewUser({ ...newUser, Phone: e.target.value })}
                            />
                        </div>
                        <Button onClick={handleAddUser}>Agregar contácto</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <div className='flex flex-col'>
                <Button onClick={()=>fetchMessages('notice')} className="mt-4 bg-green-600 font-bold">Aviso</Button>
                <Button onClick={()=>fetchMessages('warning')} className="mt-4 bg-yellow-600 font-bold">Advertencia</Button>
                <Button onClick={()=>fetchMessages('surcharge')} className="mt-4 bg-red-600 font-bold">Recargo</Button>
                <Button onClick={()=>fetchMessages('resume')} className="mt-4 bg-sky-600 font-bold">Resumen</Button>
            </div>
        </div>
    )
}