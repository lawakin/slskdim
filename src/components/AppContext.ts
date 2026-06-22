import { type AppContextValue } from '../types';
import { createContext } from 'react';

const AppContext = createContext<AppContextValue | undefined>(undefined);

export default AppContext;
