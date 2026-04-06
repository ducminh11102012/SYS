import { Store } from "../types/domain";

// In-memory storage for MVP. Can be replaced by Postgres/Redis adapters.
export const store: Store = {
  exams: new Map(),
  submissions: new Map(),
  grades: new Map()
};
