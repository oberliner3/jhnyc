import { useState, useEffect } from "react";
import type { ApiProduct, ApiProductVariant, ApiProductOption } from "@/lib/types";

export function useProductVariants(product: ApiProduct) {
  const [variants, setVariants] = useState<ApiProductVariant[]>([]);
  const [options, setOptions] = useState<ApiProductOption[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ApiProductVariant | undefined>();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      let variants: ApiProductVariant[] = [];
      let options: ApiProductOption[] = [];

      if (product.variants && product.options) {
        variants = product.variants;
        options = product.options;
      } else if (product.raw_json) {
        const { variants: rawVariants, options: rawOptions } = JSON.parse(product.raw_json);
        variants = rawVariants || [];
        options = rawOptions || [];
      }

      setVariants(variants);
      setOptions(options);

      if (variants.length > 0) {
        if (variants.length === 1) {
          setSelectedVariant(variants[0]);
        } else {
          const initialOptions: Record<string, string> = {};
          options.forEach((option) => {
            initialOptions[option.name] = option.values[0];
          });
          setSelectedOptions(initialOptions);

          const variantName = options
            .map((opt) => initialOptions[opt.name])
            .join(" / ");
          const variant = variants.find(
            (v) => v.title === variantName
          );
          setSelectedVariant(variant || variants[0]);
        }
      }
    }
  }, [product]);

  const handleOptionChange = (optionName: string, value: string) => {
    if (!product) return;
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);

    const variantName = options
      .map((opt) => newOptions[opt.name])
      .join(" / ");
    const variant = variants.find(
      (v) => v.title === variantName
    );
    setSelectedVariant(variant || variants[0]);
  };

  return {
    variants,
    options,
    selectedVariant,
    setSelectedVariant,
    selectedOptions,
    setSelectedOptions,
    handleOptionChange,
  };
}
