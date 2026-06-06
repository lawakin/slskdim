import {
  type FieldSchema,
  UI_CONFIG_SCHEMA,
  type UIConfig,
} from '../../../lib/uiConfig';
import { Checkbox } from '../../ui/checkbox';
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
  readonly onChange: (value: UIConfig[keyof UIConfig]) => void;
  readonly value: UIConfig[keyof UIConfig];
};

// eslint-disable-next-line consistent-return
const ConfigField = ({ field, onChange, value }: ConfigFieldProps) => {
  switch (field.type) {
    case 'select':
      return (
        <div className="flex flex-col gap-1">
          <label>{field.label}</label>
          <Select
            onValueChange={(v) => onChange(v as UIConfig[keyof UIConfig])}
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
            checked={value as unknown as boolean}
            id={field.label}
            onCheckedChange={(checked) =>
              onChange(checked as unknown as UIConfig[keyof UIConfig])
            }
          />
          <label htmlFor={field.label}>{field.label}</label>
        </div>
      );
    case 'color':
      return (
        <div className="flex flex-col gap-1">
          <label>{field.label}</label>
          <input
            onChange={(event) =>
              onChange(event.target.value as UIConfig[keyof UIConfig])
            }
            type="color"
            value={value as string}
          />
        </div>
      );
    case 'number':
      return (
        <div className="flex flex-col gap-1">
          <label>{field.label}</label>
          <Input
            max={field.max}
            min={field.min}
            onChange={(event) =>
              onChange(
                Number(
                  event.target.value,
                ) as unknown as UIConfig[keyof UIConfig],
              )
            }
            step={field.step}
            type="number"
            value={value as unknown as number}
          />
        </div>
      );
  }
};

const Appearance = () => {
  const [config, setConfig] = useUIConfig();

  return (
    <div className="flex flex-col gap-4">
      {(
        Object.entries(UI_CONFIG_SCHEMA) as Array<[keyof UIConfig, FieldSchema]>
      ).map(([key, field]) => (
        <ConfigField
          field={field}
          key={key}
          onChange={(v) => setConfig({ [key]: v } as Partial<UIConfig>)}
          value={config[key]}
        />
      ))}
    </div>
  );
};

export default Appearance;
