"use client";

import React from "react";

// This type allows us to pass components and their props together.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ProviderWithProps<P = {}> = [React.ComponentType<P & { children: React.ReactNode }>, P];

/**
 * Composes multiple React providers into a single, nested component structure.
 * This helps to avoid deeply nested provider trees in your application root.
 *
 * @param {object} props - The component props.
 * @param {Array<ProviderWithProps>} props.providers - An array of tuples, where each tuple contains a provider component and its props.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the providers.
 * @returns {React.ReactNode} The composed provider tree.
 */
export function ComposeProvider({
  providers,
  children,
}: {
  providers: ProviderWithProps[];
  children: React.ReactNode;
}) {
  return providers.reduceRight((acc, [Provider, props]) => {
    return <Provider {...props}>{acc}</Provider>;
  }, <>{children}</>);
}