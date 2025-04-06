import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface DataTableColumn<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  isLoading,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full h-40 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-auto ${className}`}>
      <Table>
        <TableHeader>
          <TableRow className="bg-neutral-50">
            {columns.map((column, index) => (
              <TableHead 
                key={index} 
                className={column.className || ""}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-neutral-500">
                No data to display
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, itemIndex) => (
              <TableRow 
                key={itemIndex} 
                className={onRowClick ? "cursor-pointer hover:bg-neutral-50" : ""}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column, columnIndex) => (
                  <TableCell key={columnIndex} className={column.className || ""}>
                    {column.cell
                      ? column.cell(item)
                      : column.accessorKey
                      ? (item[column.accessorKey] as React.ReactNode)
                      : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end space-x-1 mt-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 p-0"
      >
        <span className="sr-only">Previous page</span>
        <i className="ri-arrow-left-s-line"></i>
      </Button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          size="icon"
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 p-0 ${
            page === currentPage ? "bg-primary text-white" : "text-neutral-700"
          }`}
        >
          {page}
        </Button>
      ))}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 p-0"
      >
        <span className="sr-only">Next page</span>
        <i className="ri-arrow-right-s-line"></i>
      </Button>
    </div>
  );
}
