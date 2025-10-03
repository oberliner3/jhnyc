// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ProviderConfig<P = {}> = [
  React.ComponentType<P & { children: React.ReactNode }>,
  P
];
