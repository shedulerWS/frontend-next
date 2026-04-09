"use client";

interface PaginationMeta {
  current_page: number;
  last_page: number;
}

interface PaginationLinks {
  prev: string | null;
  next: string | null;
}

interface PaginationProps {
  meta: PaginationMeta | null;
  links: PaginationLinks | null;
  page: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ meta, links, page, onPageChange }: PaginationProps) {
  if (!meta || meta.last_page <= 1) return null;

  return (
    <div>
      <button disabled={!links?.prev} onClick={() => onPageChange(page - 1)}>
        Назад
      </button>

      <span>
        Стр. {meta.current_page} из {meta.last_page}
      </span>

      <button disabled={!links?.next} onClick={() => onPageChange(page + 1)}>
        Вперёд
      </button>
    </div>
  );
}
