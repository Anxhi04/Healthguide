import type { ColumnDef } from "@tanstack/react-table"

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  page: number
  lastPage: number
  onPageChange: (page: number) => void
  filters?: Record<string, any>
  onChange?: (newFilters: Record<string, any>) => void
  children?: React.ReactNode;
  actions?: React.ReactNode;
  viewMode?: string
}

// export interface PaginationProps {
//   page: number
//   lastPage: number
//   onPageChange?: (page: number) => void
// }

