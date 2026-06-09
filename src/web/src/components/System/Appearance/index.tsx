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

const ConfigGroup = ({ onChange, schema, values }: ConfigGroupProps) => (
  <>
    {Object.entries(schema).map(([key, field]) =>
      field.type === 'group' ? (
        <div
          className="flex flex-col gap-2"
          key={key}
        >
          <span className="text-sm font-medium text-muted-foreground">
            {field.label}
          </span>
          <div className="flex flex-col gap-4 pl-4 border-l">
            <ConfigGroup
              onChange={(subKey, v) => onChange(`${key}.${subKey}`, v)}
              schema={field.fields}
              values={(values[key] as Record<string, unknown>) ?? {}}
            />
          </div>
        </div>
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
