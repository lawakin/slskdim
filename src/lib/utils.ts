import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const toErrorMessage = (error: unknown): string => {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  if (typeof data === 'string' && data) {
    return data;
  }

  if (data && typeof (data as { title?: unknown }).title === 'string') {
    return (data as { title: string }).title;
  }

  const message = (error as { message?: unknown })?.message;
  if (typeof message === 'string' && message) {
    return message;
  }

  return String(error);
};
