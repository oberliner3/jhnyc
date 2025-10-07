import Image, { type ImageProps } from "next/image";
import React from "react";

type LogoProps = {
  url?: string;
  className?: string;
  children?: React.ReactNode;
};

export function Logo({ url = "#", className, children }: LogoProps) {
  return (
    <a href={url} className={className} aria-label="Logo">
      {children}
    </a>
  );
}

type LogoImageProps = Omit<ImageProps, "src"> & {
  src: ImageProps["src"];
};

export function LogoImage({ src, alt, ...rest }: LogoImageProps) {
  // Simple passthrough image; projects may replace with next/image if desired
  return <Image src={src} alt={alt} {...rest} />;
}

type LogoTextProps = React.HTMLAttributes<HTMLSpanElement> & {
  children?: React.ReactNode;
};

export function LogoText({ children, ...rest }: LogoTextProps) {
  return <span {...rest}>{children}</span>;
}
