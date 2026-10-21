import { homeModule } from '../features/home';
import { authModule } from '../features/auth';
import { boardModule } from '../features/board';
import { createFeatureRegistry } from './featureRegistry';

export const appRegistry = createFeatureRegistry([homeModule, authModule, boardModule]);
