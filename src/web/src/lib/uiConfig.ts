const STORAGE_KEY = 'slskd-ui-config';

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

// satisfies validates the schema shape without widening literal types
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
} satisfies Record<string, FieldSchema>;

type InferValue<F extends FieldSchema> =
  F extends SelectField<infer T>
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

export const getConfig = (): UIConfig => {
  const defaults = Object.fromEntries(
    Object.entries(UI_CONFIG_SCHEMA).map(([k, f]) => [k, f.default]),
  ) as UIConfig;

  const stored: Partial<UIConfig> = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || '{}',
  );

  return { ...defaults, ...stored };
};

export const setConfig = (updates: Partial<UIConfig>): UIConfig => {
  const next = { ...getConfig(), ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
};
