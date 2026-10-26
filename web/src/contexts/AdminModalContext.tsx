import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { UsersTable } from "@/services/auth/types";

interface AdminModalContextType {
  //USERS
  openEditModal: (user: UsersTable) => void;
  openDeleteModal: (userId: string) => void;
  closeEditModal: () => void;
  closeDeleteModal: () => void;
  editModalOpen: boolean;
  deleteModalOpen: boolean;
  selectedUser: UsersTable | null;
  selectedUserId: string | null;
  //BANNED WORDS
  addBannedWordModalOpen: boolean;
  deleteBannedWordModalOpen: boolean;
  selectedBannedWordId:string | null;
  openAddBannedWordModal: ()=>void;
  closeAddBannedWordModal: ()=>void;
  openDeleteBannedWordModal: (wordId: string)=>void;
  closeDeleteBannedWordModal: ()=>void;
}

const AdminModalContext = createContext<AdminModalContextType | undefined>(undefined);

export function AdminModalProvider({ children }: { children: ReactNode }) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsersTable | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedBannedWordId, setSelectedBannedWordId] =
      useState<string | null>(null);  
  const [addBannedWordModalOpen, setAddBannedWordModalOpen]= useState(false);
  const [deleteBannedWordModalOpen, setDeleteBannedWordModalOpen]=useState(false);

  const openEditModal = (user: UsersTable) => {
    setSelectedUser(user);
    setSelectedUserId(user.id);
    setEditModalOpen(true);
  };

  const openDeleteModal = (userId: string) => {
    setSelectedUserId(userId);
    setDeleteModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedUserId(null);
  };

  const openAddBannedWordModal=()=>{
    setAddBannedWordModalOpen(true);
  };
  const closeAddBannedWordModal=()=>{
    setAddBannedWordModalOpen(false);
  };
  const openDeleteBannedWordModal=(wordId : string)=>{
setSelectedBannedWordId(wordId);
    setDeleteBannedWordModalOpen(true);
  };
  const closeDeleteBannedWordModal=()=>{
    setDeleteBannedWordModalOpen(false);
    setSelectedBannedWordId(null);
  };

  return (
    <AdminModalContext.Provider
      value={{
        openEditModal,
        openDeleteModal,
        closeEditModal,
        closeDeleteModal,
        editModalOpen,
        deleteModalOpen,
        selectedUser,
        selectedUserId,
        // Banned Words
        addBannedWordModalOpen,
        deleteBannedWordModalOpen,
        selectedBannedWordId,
        openAddBannedWordModal,
        closeAddBannedWordModal,
        openDeleteBannedWordModal,
        closeDeleteBannedWordModal,
      }}
    >
      {children}
    </AdminModalContext.Provider>
  );
}

export function useAdminModal() {
  const context = useContext(AdminModalContext);

  if (!context) {
    throw new Error("useAdminModal must be used within AdminModalProvider");
  }

  return context;
}