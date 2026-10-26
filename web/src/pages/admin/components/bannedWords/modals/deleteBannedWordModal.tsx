import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { BannedWordService } from "@/services/bannedWordService"

interface DeleteModalProps {
  open: boolean
  onClose: () => void
  wordId: string | null
}

export default function DeleteModal({ open, onClose, wordId }: DeleteModalProps) {
  const onSubmit = async () => {
    if (wordId=== null) {
      return;
    }
    try {
      await BannedWordService.deleteBannedWord(wordId)
      onClose()
    } catch {
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose()
      }}
    >
      <AlertDialogContent className="border-0 bg-white shadow-2xl p-6 sm:rounded-3xl max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2Icon className="w-5 h-5 text-red-600" />
            Delete Banned Word
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600 pt-2">
            Are you sure you want to delete this word? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 flex justify-end pt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onSubmit}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete word
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
