"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Check,
  Loader2,
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";

interface UserRow {
  uid: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: unknown;
}

interface PasswordResetRequest {
  id: string;
  email: string;
  uid: string;
  status: "pending" | "approved" | "rejected";
  createdAt: unknown;
  approvedBy?: string;
  rejectedBy?: string;
}

export default function AdminPage() {
  const { user, userData, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "password-reset">(
    "users",
  );
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>(
    [],
  );
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [deletingUid, setDeletingUid] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "user">("user");
  const [editPassword, setEditPassword] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(
    null,
  );
  const [resetPassword, setResetPassword] = useState("");
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(
    null,
  );

  const getAuthHeaders = useCallback(async () => {
    if (!user) throw new Error("No autenticado");
    const token = await user.getIdToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [user]);

  const fetchUsers = useCallback(async () => {
    if (!user) return;
    setLoadingUsers(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: await getAuthHeaders(),
        cache: "no-store",
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        users?: UserRow[];
      };

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo cargar usuarios");
      }

      setUsers(data.users ?? []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error cargando usuarios";
      setError(message);
    } finally {
      setLoadingUsers(false);
    }
  }, [getAuthHeaders, user]);

  const fetchPasswordResetRequests = useCallback(async () => {
    if (!user) return;
    setLoadingRequests(true);
    setError("");
    try {
      const response = await fetch("/api/admin/password-reset-requests", {
        method: "GET",
        headers: await getAuthHeaders(),
        cache: "no-store",
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        requests?: PasswordResetRequest[];
      };

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo cargar solicitudes");
      }

      setResetRequests(data.requests ?? []);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error cargando solicitudes";
      setError(message);
    } finally {
      setLoadingRequests(false);
    }
  }, [getAuthHeaders, user]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/");
    }
  }, [user, authLoading, isAdmin, router]);

  useEffect(() => {
    if (user && isAdmin) {
      if (activeTab === "users") {
        fetchUsers();
      } else {
        fetchPasswordResetRequests();
      }
    }
  }, [user, isAdmin, fetchUsers, fetchPasswordResetRequests, activeTab]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          email: newEmail.trim(),
          password: newPassword,
          name: newName.trim(),
          role: newRole,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "Ocurrio un error al crear el usuario");
      }

      setNewEmail("");
      setNewPassword("");
      setNewName("");
      setNewRole("user");
      setShowCreateForm(false);
      await fetchUsers();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrio un error al crear el usuario",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (uid === user?.uid) return;
    const confirmed = window.confirm(
      "Seguro que deseas eliminar este usuario? Se eliminara su registro del sistema.",
    );
    if (!confirmed) return;

    setDeletingUid(uid);
    setError("");
    try {
      const response = await fetch(`/api/admin/users/${uid}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo eliminar el usuario");
      }

      setUsers((prev) => prev.filter((u) => u.uid !== uid));
      if (editingUser?.uid === uid) {
        setEditingUser(null);
        setEditPassword("");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el usuario",
      );
    } finally {
      setDeletingUid(null);
    }
  };

  const startEdit = (target: UserRow) => {
    setError("");
    setEditingUser(target);
    setEditName(target.name);
    setEditEmail(target.email);
    setEditRole(target.role);
    setEditPassword("");
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditPassword("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSavingEdit(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/users/${editingUser.uid}`, {
        method: "PATCH",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          email: editEmail.trim(),
          name: editName.trim(),
          role: editRole,
          password: editPassword.trim() || undefined,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo actualizar el usuario");
      }

      await fetchUsers();
      cancelEdit();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "No se pudo actualizar el usuario",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!resetPassword.trim()) {
      setError("Debes ingresar una contraseña");
      return;
    }
    if (resetPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setError("");
    setApprovingRequestId(requestId);
    try {
      const response = await fetch("/api/admin/password-reset-requests", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          requestId,
          action: "approve",
          newPassword: resetPassword,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo aprobar la solicitud");
      }

      setResetPassword("");
      await fetchPasswordResetRequests();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "No se pudo aprobar la solicitud",
      );
    } finally {
      setApprovingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const confirmed = window.confirm("¿Rechazar esta solicitud de reset?");
    if (!confirmed) return;

    setError("");
    setRejectingRequestId(requestId);
    try {
      const response = await fetch("/api/admin/password-reset-requests", {
        method: "POST",
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          requestId,
          action: "reject",
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo rechazar la solicitud");
      }

      await fetchPasswordResetRequests();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "No se pudo rechazar la solicitud",
      );
    } finally {
      setRejectingRequestId(null);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    const confirmed = window.confirm("¿Eliminar esta solicitud de reset?");
    if (!confirmed) return;

    setError("");
    try {
      const response = await fetch(
        `/api/admin/password-reset-requests/${requestId}`,
        {
          method: "DELETE",
          headers: await getAuthHeaders(),
        },
      );

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo eliminar la solicitud");
      }

      await fetchPasswordResetRequests();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar la solicitud",
      );
    }
  };

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-muted/50">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Link>
          <div className="h-5 w-px bg-border" />
          <Users className="size-5 text-foreground" />
          <h1 className="text-lg font-semibold text-foreground">
            Administracion
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Tabs */}
        <div className="mb-6 border-b border-border">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab("password-reset")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "password-reset"
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Solicitudes de Reset
              {resetRequests.filter((r) => r.status === "pending").length >
                0 && (
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {resetRequests.filter((r) => r.status === "pending").length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <>
            {/* Stats */}
            <div className="mb-6 flex flex-wrap gap-4">
              <Card className="flex-1 min-w-[180px]">
                <CardContent className="flex items-center gap-3 py-4">
                  <Users className="size-8 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {users.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Usuarios totales
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="flex-1 min-w-[180px]">
                <CardContent className="flex items-center gap-3 py-4">
                  <ShieldCheck className="size-8 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {users.filter((u) => u.role === "admin").length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Administradores
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-medium text-foreground">
                Lista de usuarios
              </h2>
              <Button
                variant={showCreateForm ? "outline" : "default"}
                size="sm"
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  setError("");
                }}
              >
                {showCreateForm ? (
                  <>
                    <X className="mr-1 size-4" /> Cancelar
                  </>
                ) : (
                  <>
                    <Plus className="mr-1 size-4" /> Crear usuario
                  </>
                )}
              </Button>
            </div>

            {error && (
              <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {/* Create form */}
            {showCreateForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">Nuevo usuario</CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleCreateUser}
                    className="flex flex-col gap-4"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="new-name">Nombre</Label>
                        <Input
                          id="new-name"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Nombre completo"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="new-email">Correo</Label>
                        <Input
                          id="new-email"
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="correo@ejemplo.com"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="new-password">Contrasena</Label>
                        <Input
                          id="new-password"
                          type="password"
                          autoComplete="new-password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimo 6 caracteres"
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Rol</Label>
                        <Select
                          value={newRole}
                          onValueChange={(v) =>
                            setNewRole(v as "admin" | "user")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Usuario</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={creating}>
                        {creating && (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
                        Crear usuario
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {editingUser && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">Editar usuario</CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleSaveEdit}
                    className="flex flex-col gap-4"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-name">Nombre</Label>
                        <Input
                          id="edit-name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-email">Correo</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-password">
                          Nueva contrasena (opcional)
                        </Label>
                        <Input
                          id="edit-password"
                          type="password"
                          autoComplete="new-password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Deja vacio para no cambiar"
                          minLength={6}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>Rol</Label>
                        <Select
                          value={editRole}
                          onValueChange={(v) =>
                            setEditRole(v as "admin" | "user")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Usuario</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEdit}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={savingEdit}>
                        {savingEdit && (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
                        Guardar cambios
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Users table */}
            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50 text-left">
                          <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                            Nombre
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                            Correo
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                            Rol
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr
                            key={u.uid}
                            className="border-b last:border-b-0 transition-colors hover:bg-muted/30"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-foreground">
                              {u.name}
                              {u.uid === user?.uid && (
                                <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                                  Tu
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {u.email}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                  u.role === "admin"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {u.role === "admin" ? (
                                  <ShieldCheck className="size-3" />
                                ) : (
                                  <Shield className="size-3" />
                                )}
                                {u.role === "admin" ? "Admin" : "Usuario"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {u.uid !== user?.uid && (
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEdit(u)}
                                    title="Editar usuario"
                                  >
                                    <Pencil className="size-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteUser(u.uid)}
                                    disabled={deletingUid === u.uid}
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    title="Eliminar usuario"
                                  >
                                    {deletingUid === u.uid ? (
                                      <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="size-4" />
                                    )}
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-8 text-center text-sm text-muted-foreground"
                            >
                              No hay usuarios registrados
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Password Reset Tab */}
        {activeTab === "password-reset" && (
          <>
            {error && (
              <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {/* Password reset requests table */}
            {loadingRequests ? (
              <div className="flex justify-center py-12">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50 text-left">
                          <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                            Correo
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                            Estado
                          </th>
                          <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                            Fecha
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {resetRequests.map((req) => {
                          const createdDate =
                            req.createdAt instanceof Date
                              ? req.createdAt
                              : typeof req.createdAt === "string"
                                ? new Date(req.createdAt)
                                : null;
                          const dateStr = createdDate
                            ? createdDate.toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              } as any)
                            : "Desconocida";

                          return (
                            <tr
                              key={req.id}
                              className="border-b last:border-b-0 transition-colors hover:bg-muted/30"
                            >
                              <td className="px-4 py-3 text-sm font-medium text-foreground">
                                {req.email}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    req.status === "pending"
                                      ? "bg-yellow/10 text-yellow"
                                      : req.status === "approved"
                                        ? "bg-green-500/10 text-green-600"
                                        : "bg-destructive/10 text-destructive"
                                  }`}
                                >
                                  {req.status === "pending"
                                    ? "Pendiente"
                                    : req.status === "approved"
                                      ? "Aprobado"
                                      : "Rechazado"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">
                                {dateStr}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {req.status === "pending" && (
                                    <>
                                      {approvingRequestId === req.id ? (
                                        <div className="flex gap-2">
                                          <div className="flex flex-col gap-1">
                                            <Input
                                              type="password"
                                              placeholder="Nueva contraseña"
                                              value={resetPassword}
                                              onChange={(e) =>
                                                setResetPassword(e.target.value)
                                              }
                                              minLength={6}
                                              className="h-8 w-40"
                                            />
                                            {error && (
                                              <p className="text-xs text-destructive">
                                                {error}
                                              </p>
                                            )}
                                          </div>
                                          <Button
                                            size="sm"
                                            onClick={() =>
                                              handleApproveRequest(req.id)
                                            }
                                          >
                                            Confirmar
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setApprovingRequestId(null);
                                              setResetPassword("");
                                              setError("");
                                            }}
                                          >
                                            Cancelar
                                          </Button>
                                        </div>
                                      ) : (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setApprovingRequestId(req.id);
                                              setResetPassword("");
                                              setError("");
                                            }}
                                            className="text-green-600 hover:bg-green-500/10 hover:text-green-600"
                                            title="Aprobar solicitud"
                                          >
                                            <Check className="size-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleRejectRequest(req.id)
                                            }
                                            disabled={
                                              rejectingRequestId === req.id
                                            }
                                            className="text-yellow-600 hover:bg-yellow-500/10 hover:text-yellow-600"
                                            title="Rechazar solicitud"
                                          >
                                            {rejectingRequestId === req.id ? (
                                              <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                              <X className="size-4" />
                                            )}
                                          </Button>
                                        </>
                                      )}
                                    </>
                                  )}
                                  {(req.status === "approved" ||
                                    req.status === "rejected") && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteRequest(req.id)
                                      }
                                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                      title="Eliminar solicitud"
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {resetRequests.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-8 text-center text-sm text-muted-foreground"
                            >
                              No hay solicitudes de reset
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
}
