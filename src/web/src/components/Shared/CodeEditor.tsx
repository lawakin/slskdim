import {
  defaultHighlightStyle,
  StreamLanguage,
  syntaxHighlighting,
} from '@codemirror/language';
import { yaml } from '@codemirror/legacy-modes/mode/yaml';
import CodeMirror from '@uiw/react-codemirror';

const CodeEditor = ({
  onChange = () => {},
  theme,
  value,
  ...rest
}: {
  readonly [key: string]: unknown;
  readonly onChange?: (value: string) => void;
  readonly theme?: Parameters<typeof CodeMirror>[0]['theme'];
  readonly value?: string;
}) => (
  <CodeMirror
    extensions={[
      StreamLanguage.define(yaml),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    ]}
    onChange={(newValue) => onChange(newValue)}
    theme={theme ?? undefined}
    value={value}
    {...rest}
  />
);

export default CodeEditor;
