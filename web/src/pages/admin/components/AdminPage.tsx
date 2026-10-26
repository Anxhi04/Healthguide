"use client";

import { useEffect, useState } from "react";
import { columns } from "./users/table/columns";
import { DataTable } from "@/components/table/data-table";
import { useUsers } from "@/hooks/useUsers";
import { UsersFilters } from "./users/table/usersFilters";
import AddModal from "./users/modals/addUserModal";
import EditModal from "./users/modals/editUserModal";
import DeleteModal from "./users/modals/deletemodal";
import { useAdminModal } from "@/contexts/AdminModalContext";
import { adminMenuItems } from "@/pages/admin/navigation";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider , SidebarTrigger} from "@/components/ui/sidebar";

export default function AdminPage() {
  const [page, setPage] = useState(1);
  const {
    deleteModalOpen,
    closeDeleteModal,
    selectedUserId,
    editModalOpen,
    closeEditModal,
  } = useAdminModal();

  const [filters, setFilters] = useState({
    email: "",
    name: "",
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.email, filters.name]);

  const { data, lastPage, loading, error } = useUsers(
    page,
    debouncedFilters
  );
  const [openAddModal, setOpenAddModal] = useState(false);

  function handleFiltersChange(newFilters: Record<string, string>) {
    setFilters({
      email: String(newFilters.email ?? ""),
      name: String(newFilters.name ?? ""),
    });
  }


return (
  <SidebarProvider>
    <div className="flex min-h-screen w-full bg-slate-50">
      <AppSidebar menuItems={adminMenuItems} />

        <main className="flex-1 overflow-auto top-0">
           <div className="px-4 pt-4">
          <SidebarTrigger/>
        </div>
        <div className="container mx-auto px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <p>Loading...</p>
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <div className="mx-auto max-w-[1440px] space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    Admin Dashboard
                  </h1>

                  <p className="text-sm text-slate-600">
                    Manage users and system access from one clean dashboard.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <DataTable
                    columns={columns}
                    data={data ?? []}
                    page={page}
                    lastPage={lastPage}
                    onPageChange={setPage}
                    filters={filters}
                    onChange={handleFiltersChange}
                    actions={
                      <button
                        onClick={() => setOpenAddModal(true)}
                        className="rounded-md border border-slate-300 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Add user
                      </button>
                    }
                  >
                    <UsersFilters
                      filters={filters}
                      onChange={handleFiltersChange}
                    />
                  </DataTable>
                </div>

                <AddModal
                  open={openAddModal}
                  onClose={() => setOpenAddModal(false)}
                />

                <EditModal
                  open={editModalOpen}
                  onClose={closeEditModal}
                  userId={selectedUserId}
                />

                <DeleteModal
                  open={deleteModalOpen}
                  onClose={closeDeleteModal}
                  userId={selectedUserId}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  </SidebarProvider>
);
}
