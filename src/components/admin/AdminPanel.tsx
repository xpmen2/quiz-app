// src/components/admin/AdminPanel.tsx
'use client';
import { useState } from 'react';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    isAuthorized: boolean;
    createdAt: Date;
}

interface AdminPanelProps {
    users: User[];
}

export default function AdminPanel({ users: initialUsers }: AdminPanelProps) {
    const [users, setUsers] = useState(initialUsers);

    const handleAuthorization = async (userId: number, authorize: boolean) => {
        try {
            const response = await fetch('/api/admin/authorize-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, authorize }),
            });

            if (response.ok) {
                // Actualizar la lista de usuarios localmente
                setUsers(users.map(user =>
                    user.id === userId
                        ? { ...user, isAuthorized: authorize }
                        : user
                ));
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Error al actualizar el usuario');
        }
    };

    return (
        <div className="bg-white shadow-sm rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Fecha Registro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {user.firstName} {user.lastName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isAuthorized
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {user.isAuthorized ? 'Autorizado' : 'Pendiente'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                    onClick={() => handleAuthorization(user.id, !user.isAuthorized)}
                                    className={`px-4 py-2 rounded-md text-white ${user.isAuthorized
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                >
                                    {user.isAuthorized ? 'Revocar' : 'Autorizar'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}