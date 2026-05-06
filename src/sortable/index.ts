import { SortableRoot, SortableSource, SortableBeacon } from './sortable'

export const Sortable = Object.assign(SortableRoot, {
    Source: SortableSource,
    Beacon: SortableBeacon,
})

export type { SourceMeta } from './sortable'
