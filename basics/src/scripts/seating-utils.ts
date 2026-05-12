/**
 * Pure data transformation functions for the table seating feature.
 * Used by both the Admin Table Manager and the guest-facing Table Finder page.
 * No side effects, no API calls — all functions are pure.
 */

// --- Interfaces ---

export interface Table {
  id: string;
  name: string;
  capacity: number;
}

export interface Guest {
  id: string;
  nome: string;
  mesa_id: string | null;
  email?: string;
  telefone?: string;
  restricoes?: string;
  acompanha?: number;
  qr_code?: string;
  created_at?: string;
  checked_in?: number;
  checkin_time?: string | null;
}

export interface TableWithOccupancy {
  table: Table;
  guests: Guest[];
  occupancy: number;
  isFull: boolean;
  fillLevel: 'empty' | 'partial' | 'full';
}

export interface SeatingMapState {
  view: 'overview' | 'detail';
  selectedTableId: string | null;
  highlightedGuestId: string | null;
  tables: TableWithOccupancy[];
}

// --- Pure utility functions ---

/**
 * Groups guests by their assigned table (`mesa_id`).
 * Returns a Map of table ID to the array of guests assigned to that table.
 * Guests with null `mesa_id` are not included in any table's list.
 * Tables with no assigned guests will have an empty array.
 */
export function groupGuestsByTable(
  tables: Table[],
  guests: Guest[]
): Map<string, Guest[]> {
  const map = new Map<string, Guest[]>();

  // Initialize all tables with empty arrays
  for (const table of tables) {
    map.set(table.id, []);
  }

  // Assign guests to their respective tables
  for (const guest of guests) {
    if (guest.mesa_id !== null && map.has(guest.mesa_id)) {
      map.get(guest.mesa_id)!.push(guest);
    }
  }

  return map;
}

/**
 * Partitions guests into two arrays: assigned (non-null `mesa_id`)
 * and unassigned (null `mesa_id`).
 */
export function partitionGuestsByAssignment(guests: Guest[]): {
  assigned: Guest[];
  unassigned: Guest[];
} {
  const assigned: Guest[] = [];
  const unassigned: Guest[] = [];

  for (const guest of guests) {
    if (guest.mesa_id !== null) {
      assigned.push(guest);
    } else {
      unassigned.push(guest);
    }
  }

  return { assigned, unassigned };
}

/**
 * Returns true if the number of assigned guests meets or exceeds the table capacity.
 */
export function isOverCapacity(capacity: number, assignedCount: number): boolean {
  return assignedCount >= capacity;
}

/**
 * Returns the fill level classification for a table.
 * - 'empty' when occupancy is 0
 * - 'full' when occupancy >= capacity
 * - 'partial' otherwise
 */
export function getTableFillLevel(
  occupancy: number,
  capacity: number
): 'empty' | 'partial' | 'full' {
  if (occupancy === 0) {
    return 'empty';
  }
  if (occupancy >= capacity) {
    return 'full';
  }
  return 'partial';
}

/**
 * Filters guests by a case-insensitive partial match on the `nome` field.
 * Returns all guests whose name contains the query as a substring (case-insensitive).
 * If the query is empty, returns all guests.
 */
export function searchGuestsByName(guests: Guest[], query: string): Guest[] {
  if (query === '') {
    return guests;
  }
  const lowerQuery = query.toLowerCase();
  return guests.filter((guest) => guest.nome.toLowerCase().includes(lowerQuery));
}

/**
 * Returns the ID of the guest to highlight, or null if the guest is not found
 * in the provided list.
 */
export function getHighlightedGuestId(
  guests: Guest[],
  currentGuestId: string
): string | null {
  const found = guests.find((guest) => guest.id === currentGuestId);
  return found ? found.id : null;
}
