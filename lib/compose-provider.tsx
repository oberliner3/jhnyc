"use client";

import React from "react";

/**
 * Composes multiple React providers into a single, nested component structure.
 * This helps to avoid deeply nested provider trees in your application root.
 *
 * @param {object} props - The component props.
 * @param {Array<React.JSX.Element>} props.providers - An array of provider components to be composed.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the providers.
 * @returns {React.ReactNode} The composed provider tree.
 */
export function ComposeProvider({
  providers,
  children,
}: {
  providers: Array<React.JSX.Element>;
  children: React.ReactNode;
}) {
  return providers.reduceRight(
    (acc, provider) => React.cloneElement(provider, {}, acc),
    <>{children}</>
  );
}
