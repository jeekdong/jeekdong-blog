export type ExtractArrayType<T> = T extends (infer R)[] ? R : T
