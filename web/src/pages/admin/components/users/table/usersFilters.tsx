"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Filters={
  email:string;
  name:string;
}
interface Props {
  filters:Filters,
  onChange:(filters: Filters)=>void;
  onAddClick?: () => void;
}

export function UsersFilters({
  filters,
  onChange,
  onAddClick,
}: Props) {

  return (
    <>
      <Input
        placeholder="Search for email"
        value={filters.email}
        onChange={(e) =>
          onChange({...filters, email: e.target.value})
        }
      />

      <Input
        placeholder="Search for name"
        value={filters.name}
        onChange={(e) =>
          onChange({...filters, name:e.target.value})
        }
      />

      {onAddClick && (
        <Button onClick={onAddClick}>
          Add user
        </Button>
      )}
    </>
  );
}