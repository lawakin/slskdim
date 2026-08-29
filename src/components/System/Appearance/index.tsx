import {
  type ConfigSchema,
  type FieldSchema,
  UI_CONFIG_SCHEMA,
  type UIConfig,
} from '../../../lib/uiConfig';
import { Checkbox } from '../../ui/checkbox';
import { ColorPicker } from '../../ui/color-picker';
import { Input } from '../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { useUIConfig } from '../../UIConfigContext';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const FOLD_KEY = 'slskd-appearance-folded';

const readFolded = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem(FOLD_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeFolded = (key: string, folded: boolean) => {
  const next = { ...readFolded(), [key]: folded };
  localStorage.setItem(FOLD_KEY, JSON.stringify(next));
};

type ConfigFieldProps = {
  readonly field: FieldSchema;
  readonly onChange: (value: unknown) => void;
  readonly value: unknown;
};

// eslint-disable-next-line consistent-return
const ConfigField = ({ field, onChange, value }: ConfigFieldProps) => {
  switch (field.type) {
    case 'select':
      return (
        <div className="flex flex-col gap-1">
          <label>{field.label}</label>
          <Select
            onValueChange={(v) => onChange(v)}
            value={value as string}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((o) => (
                <SelectItem
                  key={o}
                  value={o}
                >
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    case 'toggle':
      return (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={value as boolean}
            id={field.label}
            onCheckedChange={(checked) => onChange(checked)}
          />
          <label htmlFor={field.label}>{field.label}</label>
        </div>
      );
    case 'color':
      return (
        <div className="flex items-center gap-2">
          <ColorPicker
            onChange={onChange}
            value={value as string}
          />
          <label>{field.label}</label>
        </div>
      );
    case 'number':
      return (
        <div className="flex flex-col gap-1">
          <label>{field.label}</label>
          <Input
            max={field.max}
            min={field.min}
            onChange={(event) => onChange(Number(event.target.value))}
            step={field.step}
            type="number"
            value={value as number}
          />
        </div>
      );
  }
};

type ConfigGroupProps = {
  readonly onChange: (key: string, value: unknown) => void;
  readonly schema: ConfigSchema;
  readonly values: Record<string, unknown>;
};

type ConfigGroupNodeProps = {
  readonly fields: ConfigSchema;
  readonly groupKey: string;
  readonly label: string;
  readonly onChange: (key: string, value: unknown) => void;
  readonly values: Record<string, unknown>;
};

const ConfigGroupNode = ({
  fields,
  groupKey,
  label,
  onChange,
  values,
}: ConfigGroupNodeProps) => {
  const [folded, setFolded] = useState(() => readFolded()[groupKey] ?? false);

  const toggle = () => {
    setFolded((previous) => {
      const next = !previous;
      writeFolded(groupKey, next);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
        onClick={toggle}
        type="button"
      >
        {folded ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        {label}
      </button>
      {!folded && (
        <div className="flex flex-col gap-4 pl-4 border-l">
          <ConfigGroup
            onChange={(subKey, v) => onChange(`${groupKey}.${subKey}`, v)}
            schema={fields}
            values={(values[groupKey] as Record<string, unknown>) ?? {}}
          />
        </div>
      )}
    </div>
  );
};

const ConfigGroup = ({ onChange, schema, values }: ConfigGroupProps) => (
  <>
    {Object.entries(schema).map(([key, field]) =>
      field.type === 'group' ? (
        <ConfigGroupNode
          fields={field.fields}
          groupKey={key}
          key={key}
          label={field.label}
          onChange={onChange}
          values={values}
        />
      ) : (
        <ConfigField
          field={field}
          key={key}
          onChange={(v) => onChange(key, v)}
          value={values[key]}
        />
      ),
    )}
  </>
);

const Appearance = () => {
  const [config, setConfig] = useUIConfig();

  const handleChange = (key: string, value: unknown) => {
    // Dot-notation key like "colors.text_color" → nested partial update
    const parts = key.split('.');
    const update = parts.reduceRight<Record<string, unknown>>(
      (accumulator, part) => ({ [part]: accumulator }),
      value as Record<string, unknown>,
    );
    setConfig(update as Partial<UIConfig>);
  };

  return (
    <div className="flex flex-col gap-4">
      <ConfigGroup
        onChange={handleChange}
        schema={UI_CONFIG_SCHEMA}
        values={config as unknown as Record<string, unknown>}
      />
    </div>
  );
};

export default Appearance;
