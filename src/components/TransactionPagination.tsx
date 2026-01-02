import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
  offset: number;
  setOffset: (v: number) => void;
  total: number;
  limit?: number;
};

export function TransactionsPagination({
  offset,
  setOffset,
  total,
  limit = 10,
}: Props) {
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            aria-disabled={page === 1}
            onClick={() =>
              page > 1 && setOffset((page - 2) * limit)
            }
          />
        </PaginationItem>

        {/* Page numbers */}
        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNumber = i + 1;
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                isActive={page === pageNumber}
                onClick={() =>{
                  setOffset((pageNumber - 1) * limit)
                  console.log("offset set to", (pageNumber - 1) * limit);
                }
                }
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            aria-disabled={page === totalPages}
            onClick={() =>
              page < totalPages && setOffset(page * limit)
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
