'use client';

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
};

export function TaskFilters({ search, onSearchChange, statusFilter, onStatusFilterChange }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
      <div className="flex-1">
        <label htmlFor="search" className="label sr-only">
          Search tasks
        </label>
        <input
          id="search"
          type="search"
          placeholder="Search by title or description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input-field"
        />
      </div>
      <div className="w-full sm:w-48">
        <label htmlFor="status" className="label sr-only">
          Filter by status
        </label>
        <select
          id="status"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="input-field"
        >
          <option value="">All statuses</option>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
}
