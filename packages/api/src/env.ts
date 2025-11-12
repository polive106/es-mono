// Load environment variables from monorepo root
// This file must be imported FIRST before any other modules
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../../.env') });
