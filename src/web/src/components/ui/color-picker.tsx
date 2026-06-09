import { HexAlphaColorPicker } from 'react-colorful';
import React, { useEffect, useState } from 'react';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

type RGBA = { a: number; b: number; g: number; r: number };

const normalize = (hex: string): string =>
  hex.length === 7 ? hex + 'ff' : hex;

const hexToRgba = (hex: string): RGBA => {
  const result = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(
    normalize(hex),
  );
  return result
    ? {
        a: parseInt(result[4], 16),
        b: parseInt(result[3], 16),
        g: parseInt(result[2], 16),
        r: parseInt(result[1], 16),
      }
    : { a: 255, b: 0, g: 0, r: 0 };
};

const rgbaToHex = (r: number, g: number, b: number, a: number): string =>
  '#' +
  [r, g, b, a]
    .map((v) =>
      Math.max(0, Math.min(255, v))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');

type ColorPickerProps = {
  readonly onChange: (value: string) => void;
  readonly value: string;
};

const ColorPicker = ({ onChange, value }: ColorPickerProps) => {
  const normalized = normalize(value);
  const [hexInput, setHexInput] = useState(normalized);

  useEffect(() => {
    setHexInput(normalize(value));
  }, [value]);

  const rgba = hexToRgba(value);

  const handlePickerChange = (hex: string) => {
    setHexInput(hex);
    onChange(hex);
  };

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setHexInput(raw);
    if (/^#[\da-f]{6}([\da-f]{2})?$/i.test(raw)) {
      onChange(raw.length === 7 ? raw + 'ff' : raw);
    }
  };

  const handleChannelInput = (channel: keyof RGBA, raw: string) => {
    const num = Math.max(0, Math.min(255, parseInt(raw, 10) || 0));
    const updated = { ...rgba, [channel]: num };
    const hex = rgbaToHex(updated.r, updated.g, updated.b, updated.a);
    setHexInput(hex);
    onChange(hex);
  };

  return (
    <Popover>
      <PopoverTrigger>
        <button
          className="h-8 w-8 rounded border border-input shadow-sm transition-opacity hover:opacity-80"
          style={{ backgroundColor: normalized }}
          type="button"
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-3"
        side="bottom"
      >
        <HexAlphaColorPicker
          color={normalized}
          onChange={handlePickerChange}
          style={{ width: '100%' }}
        />
        <div className="mt-2 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-8 shrink-0 text-xs text-muted-foreground">HEX</span>
            <Input
              className="h-7 font-mono text-xs"
              onChange={handleHexInput}
              value={hexInput}
            />
          </div>
          <div className="flex gap-1.5">
            {(['r', 'g', 'b', 'a'] as const).map((ch) => (
              <div
                className="flex flex-col items-center gap-0.5"
                key={ch}
              >
                <span className="text-xs uppercase text-muted-foreground">
                  {ch}
                </span>
                <Input
                  className="h-7 w-14 text-center text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  max={255}
                  min={0}
                  onChange={(e) => handleChannelInput(ch, e.target.value)}
                  type="number"
                  value={rgba[ch]}
                />
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { ColorPicker };
