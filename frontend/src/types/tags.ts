export type TagValueMode = 'ENUM' | 'DYNAMIC' | 'FREEFORM';

export type TagValueOption = {
  value: string;
  label?: string;
  color?: string | null;
  usageCount?: number;
};

export type TagKeyMetadata = {
  key: string;
  label: string;
  description?: string | null;
  category?: string | null;
  isRequired?: boolean;
  validationRegex?: string | null;
  valueMode: TagValueMode;
  usageCount?: number;
  distinctCount?: number;
  allowedValues?: TagValueOption[];
  sampleValues?: TagValueOption[];
};

export type TagMetadataResponse = {
  tags: Array<{
    key: string;
    label?: string;
    description?: string | null;
    category?: string | null;
    is_required?: boolean;
    validation_regex?: string | null;
    value_mode?: TagValueMode;
    usage_count?: number;
    distinct_count?: number;
    allowed_values?: Array<{
      id?: string;
      value: string;
      label?: string;
      color?: string | null;
      usage_count?: number;
    }>;
    sample_values?: Array<{
      value: string;
      label?: string;
      color?: string | null;
      usage_count?: number;
    }>;
  }>;
  total?: number;
  generated_at?: string;
};

export type TagValueResponse = {
  key: string;
  mode?: TagValueMode;
  total?: number;
  items: Array<{
    value: string;
    label?: string;
    color?: string | null;
    usage_count?: number;
  }>;
  generated_at?: string;
};

export type TagValueRequestOptions = {
  search?: string;
  limit?: number;
};

