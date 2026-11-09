import product from './product.json'
import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'py.rotacion.demo',
  appName: product.name,
  webDir: 'dist',
  android: { backgroundColor: '#f4f5ef' },
}
export default config
