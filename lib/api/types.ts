export type Assistant = {
  id: string;
  name: string;
}

export type Course = {
  id: string;
  name: string;
  assistant_id: string;
  available: boolean;
}

export type QAResponse = {
  content: string;
}

export type Generation = {
  assistant_id: string;
  course_id: string;
  generation: string;
  date: string;
}

export type AuthResponse = {
  jwt_access_token: string;
}

export type GenerationsFilters = {
  assistant_id?: string;
  course_id?: string;
  before_date?: string;
  after_date?: string;
}
