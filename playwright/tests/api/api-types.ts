export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string | null;
  date_of_birth?: string | null;
  category?: string;
  notes?: string | null;
  created_at?: string;
}

export interface ContactsResponse {
  status: 'success' | 'error';
  data?: Contact[];
  message?: string;
}

export interface StarSign {
  sign: string;
  symbol: string;
  date_range: string;
  traits: string;
  formatted: string;
}

export interface FactItem {
  year?: number | null;
  text: string;
  type: string;
  formatted: string;
}

export interface DobDetails {
  dob: string;
  year: number;
  month: number;
  day: number;
  star_sign: StarSign;
  facts: FactItem[];
  primary_fact: string;
  total_facts: number;
}

export interface DobFactsResponse {
  status: 'success' | 'error';
  data?: DobDetails;
  message?: string;
}

export interface ContactActionResponse {
  status: 'success' | 'error';
  id?: number;
  message?: string;
  dob_details?: DobDetails;
  dob_fact?: string;
}
