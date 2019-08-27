import { TAG } from '@/const'

export function Deprecated() {
  return (target, name) => {
    const meta = Reflect.getMetadata(TAG, target, name) || []
    if (meta.some(item => item.name === 'deprecated')) {
      throw new Error('Need not set deprecated again')
    }

    meta.push({ name: 'deprecated' })
    Reflect.defineMetadata(TAG, meta, target, name)
  }
}
