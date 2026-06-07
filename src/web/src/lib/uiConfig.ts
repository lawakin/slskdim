const STORAGE_KEY = 'slskd-ui-config';

// ---------------------------------------------------------------------------
// Field types
// ---------------------------------------------------------------------------

type SelectField<T extends readonly string[]> = {
  default: T[number];
  label: string;
  options: T;
  type: 'select';
};
type ToggleField = { default: boolean; label: string; type: 'toggle' };
type ColorField = { default: string; label: string; type: 'color' };
type NumberField = {
  default: number;
  label: string;
  max?: number;
  min?: number;
  step?: number;
  type: 'number';
};

export type FieldSchema =
  | SelectField<readonly string[]>
  | ToggleField
  | ColorField
  | NumberField;

// A group node — contains nested fields, not a leaf field itself
type GroupField = {
  fields: ConfigSchema;
  label: string;
  type: 'group';
};

// Schema nodes are either leaf fields or groups
export type ConfigSchema = Record<string, FieldSchema | GroupField>;

// ---------------------------------------------------------------------------
// Schema definition
// ---------------------------------------------------------------------------

export const UI_CONFIG_SCHEMA = {
  barPosition: {
    type: 'select' as const,
    label: 'Navigation Position',
    default: 'left' as const,
    options: ['left', 'right', 'top', 'bottom'] as const,
  },
  text_color: {
    type: 'color' as const,
    label: 'Text Color',
    default: '#FFFFFF',
  },
  background_color: {
    type: 'color' as const,
    label: 'Background Color',
    default: '#000000',
  },
  secondary_background_color: {
    type: 'color' as const,
    label: 'Secondary Background Color',
    default: '#101010',
  },
  muted_background_color: {
    type: 'color' as const,
    label: 'Muted Background Color',
    default: '#101010',
  },
  primary_color: {
    type: 'color' as const,
    label: 'Primary Color',
    default: '#101010',
  },
  primary_foreground_color: {
    type: 'color' as const,
    label: 'Primary Foreground Color',
    default: '#ffffff',
  },
  muted_foreground_color: {
    type: 'color' as const,
    label: 'Muted Foreground Color',
    default: '#888888',
  },
  border_color: {
    type: 'color' as const,
    label: 'Border Color',
    default: '#333333',
  },
  ring_color: {
    type: 'color' as const,
    label: 'Ring Color',
    default: '#555555',
  },
  destructive_color: {
    type: 'color' as const,
    label: 'Destructive Color',
    default: '#cc0000',
  },
  sidebar: {
    type: 'group' as const,
    label: 'Colors',
    fields: {
      ring_color: {
        type: 'color' as const,
        label: 'Ring Color',
        default: '#555555',
      },
    },
  },
} satisfies ConfigSchema;

// ---------------------------------------------------------------------------
// Type inference
// ---------------------------------------------------------------------------

type InferValue<F extends FieldSchema | GroupField> = F extends GroupField
  ? { [K in keyof F['fields']]: InferValue<F['fields'][K]> }
  : F extends SelectField<infer T>
    ? T[number]
    : F extends ToggleField
      ? boolean
      : F extends ColorField
        ? string
        : F extends NumberField
          ? number
          : never;

export type UIConfig = {
  [K in keyof typeof UI_CONFIG_SCHEMA]: InferValue<
    (typeof UI_CONFIG_SCHEMA)[K]
  >;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const extractDefaults = (schema: ConfigSchema): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(schema).map(([k, f]) => [
      k,
      f.type === 'group' ? extractDefaults(f.fields) : f.default,
    ]),
  );
};

const deepMerge = (
  base: Record<string, unknown>,
  over: Record<string, unknown>,
): Record<string, unknown> => {
  const result = { ...base };
  for (const [k, v] of Object.entries(over)) {
    if (
      v !== null &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      typeof base[k] === 'object'
    ) {
      result[k] = deepMerge(
        base[k] as Record<string, unknown>,
        v as Record<string, unknown>,
      );
    } else if (v !== undefined) {
      result[k] = v;
    }
  }

  return result;
};

// Flatten nested config to dot-notation keys for storage:
// { colors: { text_color: "#fff" } } → { "colors.text_color": "#fff" }
const flattenConfig = (
  object: Record<string, unknown>,
  prefix = '',
): Record<string, unknown> => {
  return Object.entries(object).reduce<Record<string, unknown>>(
    (accumulator, [k, v]) => {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        Object.assign(
          accumulator,
          flattenConfig(v as Record<string, unknown>, key),
        );
      } else {
        accumulator[key] = v;
      }

      return accumulator;
    },
    {},
  );
};

// Reverse of flattenConfig
const unflattenConfig = (
  flat: Record<string, unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let current = result;
    for (let index = 0; index < parts.length - 1; index++) {
      current[parts[index]] ??= {};
      current = current[parts[index]] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
  }

  return result;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const getConfig = (): UIConfig => {
  const defaults = extractDefaults(UI_CONFIG_SCHEMA);
  const flat = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const stored = unflattenConfig(flat);
  return deepMerge(defaults, stored) as UIConfig;
};

export const setConfig = (updates: Partial<UIConfig>): UIConfig => {
  const next = deepMerge(
    getConfig() as Record<string, unknown>,
    updates as Record<string, unknown>,
  ) as UIConfig;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(flattenConfig(next as Record<string, unknown>)),
  );
  return next;
};
