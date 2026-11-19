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

export interface SettingItem {
  setting_key: string;
  setting_value: string;
  enabled: boolean | null;
  description: string;
  updated_at?: string;
}

export interface SettingsMap {
  settings_display_enabled: boolean;
  duplicates_enabled: boolean;
  duplicates_match_name: boolean;
  duplicates_match_phone: boolean;
  duplicates_match_email: boolean;
  duplicates_match_dob: boolean;
  [key: string]: boolean | string | undefined;
}

export interface SettingsResponse {
  status: 'success' | 'error';
  settings: SettingsMap;
  items?: SettingItem[];
  message?: string;
}

export interface DuplicateGroup {
  field: 'Name' | 'Phone Number' | 'Email' | 'Date of Birth';
  match_key: string;
  display_value: string;
  contacts: Contact[];
}

export interface DuplicatesResponse {
  status: 'success' | 'error';
  duplicate_group_count: number;
  duplicate_contact_ids: number[];
  groups: DuplicateGroup[];
  settings: SettingsMap;
  message?: string;
}
