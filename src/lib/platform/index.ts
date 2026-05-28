import type { IPlatform } from './types';
import { SimplePlatform } from './simple';

export const platform: IPlatform = new SimplePlatform();
