import {
  type FieldSchema,
  UI_CONFIG_SCHEMA,
  type UIConfig,
} from '../../../lib/uiConfig';
import { useUIConfig } from '../../UIConfigContext';
import { Checkbox, Form, Input, Select } from 'semantic-ui-react';

type ConfigFieldProps = {
  readonly field: FieldSchema;
  readonly onChange: (value: UIConfig[keyof UIConfig]) => void;
  readonly value: UIConfig[keyof UIConfig];
};

const ConfigField = ({
  field,
  onChange,
  value,
  // eslint-disable-next-line consistent-return
}: ConfigFieldProps): React.JSX.Element => {
  switch (field.type) {
    case 'select':
      return (
        <Form.Field>
          <label style={{ color: 'white' }}>{field.label}</label>
          <Select
            onChange={(_event, { value: v }) =>
              onChange(v as UIConfig[keyof UIConfig])
            }
            options={field.options.map((o) => ({ key: o, text: o, value: o }))}
            style={{ color: 'white' }}
            value={value as string}
          />
        </Form.Field>
      );
    case 'toggle':
      return (
        <Form.Field>
          <Checkbox
            checked={value as unknown as boolean}
            label={field.label}
            onChange={(_event, { checked }) =>
              onChange(checked as unknown as UIConfig[keyof UIConfig])
            }
            style={{ color: 'white' }}
            toggle
          />
        </Form.Field>
      );
    case 'color':
      return (
        <Form.Field>
          <label style={{ color: 'white' }}>{field.label}</label>
          <input
            onChange={(event) =>
              onChange(
                event.target.value as unknown as UIConfig[keyof UIConfig],
              )
            }
            style={{ color: 'white' }}
            type="color"
            value={value as string}
          />
        </Form.Field>
      );
    case 'number':
      return (
        <Form.Field>
          <label style={{ color: 'white' }}>{field.label}</label>
          <Input
            max={field.max}
            min={field.min}
            onChange={(_event, { value: v }) =>
              onChange(Number(v) as unknown as UIConfig[keyof UIConfig])
            }
            step={field.step}
            style={{ color: 'white' }}
            type="number"
            value={value as unknown as number}
          />
        </Form.Field>
      );
  }
};

const Appearance = () => {
  const [config, setConfig] = useUIConfig();

  return (
    <Form>
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
    </Form>
  );
};

export default Appearance;
