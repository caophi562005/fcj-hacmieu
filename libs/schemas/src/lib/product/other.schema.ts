import { z } from 'zod';

export const VariantSchema = z.object({
  value: z.string().trim(),
  options: z.array(z.string().trim()),
});

export const VariantsProductSchema = z
  .array(VariantSchema)
  .superRefine((variants, ctx) => {
    //Kiểm tra variants và variant option có bị trùng không
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const isExistingVariant =
        variants.findIndex(
          (v) => v.value.toLowerCase() === variant.value.toLowerCase()
        ) !== i;
      if (isExistingVariant) {
        return ctx.addIssue({
          code: 'custom',
          message: `Giá trị ${variant.value} đã tồn tại trong danh sách variants`,
        });
      }

      const isDifferentOption = variant.options.some((option, index) => {
        const isExistingOption =
          variant.options.findIndex(
            (o) => o.toLowerCase() === option.toLowerCase()
          ) !== index;
        return isExistingOption;
      });
      if (isDifferentOption) {
        return ctx.addIssue({
          code: 'custom',
          message: `Variant ${variant.value} chứa các option trùng`,
        });
      }
    }
  });

export const AttributeProductSchema = z.object({
  name: z.string(),
  value: z.string(),
});

export const AttributesProductSchema = z
  .array(AttributeProductSchema)
  .superRefine((attrs, ctx) => {
    const seenKeys = new Set<string>();
    for (const attr of attrs) {
      const name = attr.name.trim().toLowerCase();

      // Check trùng name
      if (seenKeys.has(name)) {
        ctx.addIssue({
          code: 'custom',
          message: `Thuộc tính "${attr.name}" bị trùng.`,
        });
      } else {
        seenKeys.add(name);
      }

      // Name rỗng
      if (!attr.name.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: `Name không được để trống.`,
        });
      }

      // Value rỗng
      if (!attr.value.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: `Giá trị của thuộc tính "${attr.name}" không được để trống.`,
        });
      }
    }
  });

export type VariantsProduct = z.infer<typeof VariantsProductSchema>;
export type AttributesProduct = z.infer<typeof AttributesProductSchema>;
