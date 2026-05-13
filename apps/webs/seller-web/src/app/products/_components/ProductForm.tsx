'use client';

import { ProductStatusValues } from '@common/constants/product.constant';
import { generateSKUs } from '@common/utils/generate-skus.util';
import { fileToBase64DataUrl } from '@common/web-core/lib/image-base64';
import {
  ALLOWED_IMAGE_MIME,
  IMAGE_ACCEPT,
} from '@common/web-core/lib/image-constants';
import { ArrowLeft, ImageIcon, Plus, Save, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import type { BrandOption, CategoryOption } from '../../../lib/catalog';
import type {
  DistrictResponse,
  ProvinceResponse,
  WardResponse,
} from '../../../lib/location';
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from '../actions';
import { loadChildCategories, loadDistricts, loadWards } from '../lookups';

type Variant = { value: string; options: string[] };
type Sku = { value: string; price: number; stock: number; image?: string };
type Attribute = { name: string; value: string };

type Status = (typeof ProductStatusValues)[keyof typeof ProductStatusValues];

// Category gắn vào product (từ ProductResponse) — đủ để suy ra parent/child.
type ProductCategoryRef = {
  id: string;
  name: string;
  parentCategoryId?: string | null;
};

export type ProductFormInitial = {
  id?: string;
  name: string;
  description: string;
  basePrice: number;
  virtualPrice: number;
  status: Status;
  brandId?: string;
  sizeGuide?: string;
  images: string[];
  variants: Variant[];
  skus: Sku[];
  attributes: Attribute[];
  categories: string[];
  // Quan hệ category để derive parent/child khi edit.
  categoryRefs?: ProductCategoryRef[];
  provinceId: number;
  provinceName: string;
  districtId: number;
  districtName: string;
  wardId: number;
  wardName: string;
};

// Form mới chưa chọn địa điểm — để 0 để selector hiển thị placeholder.
const EMPTY_LOCATION = {
  provinceId: 0,
  provinceName: '',
  districtId: 0,
  districtName: '',
  wardId: 0,
  wardName: '',
};

export const EMPTY_PRODUCT: ProductFormInitial = {
  name: '',
  description: '',
  basePrice: 0,
  virtualPrice: 0,
  status: ProductStatusValues.DRAFT,
  brandId: '',
  sizeGuide: '',
  images: [],
  variants: [],
  skus: [{ value: '', price: 0, stock: 100, image: '' }],
  attributes: [],
  categories: [],
  categoryRefs: [],
  ...EMPTY_LOCATION,
};

type Props = {
  mode: 'create' | 'edit';
  initial: ProductFormInitial;
  // Lookups load sẵn ở server
  brands: BrandOption[];
  rootCategories: CategoryOption[];
  provinces: ProvinceResponse[];
  // Pre-fetched dependent lookups cho initial (tránh POST mount).
  initialChildCategories?: CategoryOption[];
  initialDistricts?: DistrictResponse[];
  initialWards?: WardResponse[];
};

export function ProductForm({
  mode,
  initial,
  brands,
  rootCategories,
  provinces,
  initialChildCategories,
  initialDistricts,
  initialWards,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>('');

  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [basePrice, setBasePrice] = useState(initial.basePrice);
  const [virtualPrice, setVirtualPrice] = useState(initial.virtualPrice);
  const [status, setStatus] = useState<Status>(initial.status);
  const [brandId, setBrandId] = useState(initial.brandId ?? '');
  const [sizeGuide, setSizeGuide] = useState(initial.sizeGuide ?? '');
  const [existingImages, setExistingImages] = useState<string[]>(
    initial.images,
  );
  const [newImageBase64DataUrls, setNewImageBase64DataUrls] = useState<
    string[]
  >([]);
  const [variants, setVariants] = useState<Variant[]>(initial.variants);
  const [skus, setSkus] = useState<Sku[]>(initial.skus);
  const [attributes, setAttributes] = useState<Attribute[]>(initial.attributes);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const skuImageInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [skuImagePreviewOverrides, setSkuImagePreviewOverrides] = useState<
    Record<number, string>
  >({});
  const [newSkuImageBase64ByIndex, setNewSkuImageBase64ByIndex] = useState<
    Record<number, string>
  >({});

  // Suy diễn parent / child category id từ refs khi edit.
  const initialParentCategory = useMemo(() => {
    const refs = initial.categoryRefs ?? [];
    const parent = refs.find(
      (c) => !c.parentCategoryId || c.parentCategoryId === null,
    );
    if (parent) return parent.id;
    // Nếu không xác định được, lấy id đầu tiên có trong categories[].
    return initial.categories[0] ?? '';
  }, [initial]);
  const initialChildCategory = useMemo(() => {
    const refs = initial.categoryRefs ?? [];
    const child = refs.find(
      (c) => c.parentCategoryId && c.parentCategoryId !== null,
    );
    return child?.id ?? '';
  }, [initial]);

  const [parentCategoryId, setParentCategoryId] = useState(
    initialParentCategory,
  );
  const [childCategoryId, setChildCategoryId] = useState(initialChildCategory);
  const [childCategories, setChildCategories] = useState<CategoryOption[]>(
    initialChildCategories ?? [],
  );
  const [loadingChildren, setLoadingChildren] = useState(false);

  // Location states
  const [provinceId, setProvinceId] = useState(initial.provinceId || 0);
  const [districtId, setDistrictId] = useState(initial.districtId || 0);
  const [wardId, setWardId] = useState(initial.wardId || 0);
  const [districts, setDistricts] = useState<DistrictResponse[]>(
    initialDistricts ?? [],
  );
  const [wards, setWards] = useState<WardResponse[]>(initialWards ?? []);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Refs ghi nhớ "key" mà dữ liệu prefetched phục vụ. Khi key hiện tại
  // trùng với key prefetched, bỏ qua effect (kể cả strict-mode gọi 2 lần).
  // Khi user đổi sang key khác rồi đổi quay về, key prefetched đã bị hủy
  // để fetch mới.
  const prefetchedParentRef = useRef<string | null>(
    initialChildCategories ? initialParentCategory : null,
  );
  const prefetchedProvinceRef = useRef<number | null>(
    initialDistricts ? initial.provinceId || 0 : null,
  );
  const prefetchedDistrictRef = useRef<number | null>(
    initialWards ? initial.districtId || 0 : null,
  );

  // Tự nạp child categories khi parent thay đổi.
  useEffect(() => {
    // Skip nếu đang dùng dữ liệu prefetched cho parent hiện tại.
    if (
      prefetchedParentRef.current !== null &&
      prefetchedParentRef.current === parentCategoryId
    ) {
      return;
    }
    prefetchedParentRef.current = null;
    if (!parentCategoryId) {
      setChildCategories([]);
      return;
    }
    let cancelled = false;
    setLoadingChildren(true);
    loadChildCategories(parentCategoryId)
      .then((list) => {
        if (cancelled) return;
        setChildCategories(list);
      })
      .finally(() => {
        if (!cancelled) setLoadingChildren(false);
      });
    return () => {
      cancelled = true;
    };
  }, [parentCategoryId]);

  // Tự nạp districts khi province thay đổi.
  useEffect(() => {
    if (
      prefetchedProvinceRef.current !== null &&
      prefetchedProvinceRef.current === provinceId
    ) {
      return;
    }
    prefetchedProvinceRef.current = null;
    if (!provinceId) {
      setDistricts([]);
      return;
    }
    let cancelled = false;
    setLoadingDistricts(true);
    loadDistricts(provinceId)
      .then((list) => {
        if (cancelled) return;
        setDistricts(list);
      })
      .finally(() => {
        if (!cancelled) setLoadingDistricts(false);
      });
    return () => {
      cancelled = true;
    };
  }, [provinceId]);

  // Tự nạp wards khi district thay đổi.
  useEffect(() => {
    if (
      prefetchedDistrictRef.current !== null &&
      prefetchedDistrictRef.current === districtId
    ) {
      return;
    }
    prefetchedDistrictRef.current = null;
    if (!districtId) {
      setWards([]);
      return;
    }
    let cancelled = false;
    setLoadingWards(true);
    loadWards(districtId)
      .then((list) => {
        if (cancelled) return;
        setWards(list);
      })
      .finally(() => {
        if (!cancelled) setLoadingWards(false);
      });
    return () => {
      cancelled = true;
    };
  }, [districtId]);

  // Tự động sinh lại SKUs khi variants thay đổi — giữ lại price/stock/image
  // nếu `value` của SKU mới trùng với SKU cũ.
  const regenerateSkus = (nextVariants: Variant[], prevSkus: Sku[]) => {
    const generated = generateSKUs(nextVariants) as Sku[];
    const map = new Map(prevSkus.map((s) => [s.value, s]));
    return generated.map((g) => {
      const found = map.get(g.value);
      return {
        value: g.value,
        price: found?.price ?? basePrice ?? 0,
        stock: found?.stock ?? 100,
        image: found?.image ?? '',
      };
    });
  };

  const generatedSkuValues = useMemo(
    () => (generateSKUs(variants) as Sku[]).map((s) => s.value),
    [variants],
  );

  // Variants handlers
  const addVariant = () =>
    setVariants((v) => [...v, { value: '', options: [''] }]);
  const removeVariant = (idx: number) => {
    const next = variants.filter((_, i) => i !== idx);
    setVariants(next);
    setSkus((prev) => regenerateSkus(next, prev));
  };
  const updateVariantName = (idx: number, name: string) => {
    const next = variants.map((v, i) =>
      i === idx ? { ...v, value: name } : v,
    );
    setVariants(next);
  };
  const addOption = (vIdx: number) => {
    const next = variants.map((v, i) =>
      i === vIdx ? { ...v, options: [...v.options, ''] } : v,
    );
    setVariants(next);
    setSkus((prev) => regenerateSkus(next, prev));
  };
  const updateOption = (vIdx: number, oIdx: number, option: string) => {
    const next = variants.map((v, i) =>
      i === vIdx
        ? {
            ...v,
            options: v.options.map((o, j) => (j === oIdx ? option : o)),
          }
        : v,
    );
    setVariants(next);
    setSkus((prev) => regenerateSkus(next, prev));
  };
  const removeOption = (vIdx: number, oIdx: number) => {
    const next = variants.map((v, i) =>
      i === vIdx
        ? { ...v, options: v.options.filter((_, j) => j !== oIdx) }
        : v,
    );
    setVariants(next);
    setSkus((prev) => regenerateSkus(next, prev));
  };

  const imagePreviewItems = useMemo(
    () => [
      ...existingImages.map((src, index) => ({
        id: `existing-${index}-${src}`,
        src,
        index,
        isNew: false,
      })),
      ...newImageBase64DataUrls.map((src, index) => ({
        id: `new-${index}`,
        src,
        index,
        isNew: true,
      })),
    ],
    [existingImages, newImageBase64DataUrls],
  );

  const onImageFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const hasInvalidMime = fileList.some(
      (file) =>
        !ALLOWED_IMAGE_MIME.includes(
          file.type as (typeof ALLOWED_IMAGE_MIME)[number],
        ),
    );

    if (hasInvalidMime) {
      setError('Chỉ chấp nhận ảnh PNG, JPG, JPEG hoặc WEBP.');
      e.target.value = '';
      return;
    }

    try {
      const nextBase64DataUrls = await Promise.all(
        fileList.map((file) => fileToBase64DataUrl(file)),
      );
      setNewImageBase64DataUrls((prev) => [...prev, ...nextBase64DataUrls]);
      setError('');
    } catch {
      setError('Không thể đọc file ảnh. Vui lòng thử lại.');
    } finally {
      e.target.value = '';
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageBase64DataUrls((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setSkuImagePreviewOverrides((prev) => {
      const next: Record<number, string> = {};
      for (const [rawIndex, base64] of Object.entries(prev)) {
        const index = Number(rawIndex);
        if (Number.isInteger(index) && index >= 0 && index < skus.length) {
          next[index] = base64;
        }
      }
      return next;
    });

    setNewSkuImageBase64ByIndex((prev) => {
      const next: Record<number, string> = {};
      for (const [rawIndex, base64] of Object.entries(prev)) {
        const index = Number(rawIndex);
        if (Number.isInteger(index) && index >= 0 && index < skus.length) {
          next[index] = base64;
        }
      }
      return next;
    });
  }, [skus.length]);

  const onSkuImageChange = async (
    skuIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !ALLOWED_IMAGE_MIME.includes(
        file.type as (typeof ALLOWED_IMAGE_MIME)[number],
      )
    ) {
      setError('Chỉ chấp nhận ảnh PNG, JPG, JPEG hoặc WEBP.');
      e.target.value = '';
      return;
    }

    try {
      const base64DataUrl = await fileToBase64DataUrl(file);
      setSkuImagePreviewOverrides((prev) => ({
        ...prev,
        [skuIndex]: base64DataUrl,
      }));
      setNewSkuImageBase64ByIndex((prev) => ({
        ...prev,
        [skuIndex]: base64DataUrl,
      }));
      setError('');
    } catch {
      setError('Không thể đọc file ảnh SKU. Vui lòng thử lại.');
    } finally {
      e.target.value = '';
    }
  };

  const removeSkuImagePreview = (skuIndex: number) => {
    setSkuImagePreviewOverrides((prev) => {
      const next = { ...prev };
      delete next[skuIndex];
      return next;
    });
    setNewSkuImageBase64ByIndex((prev) => {
      const next = { ...prev };
      delete next[skuIndex];
      return next;
    });
    if (skuImageInputRefs.current[skuIndex]) {
      skuImageInputRefs.current[skuIndex]!.value = '';
    }
  };

  // Attributes
  const addAttribute = () =>
    setAttributes((a) => [...a, { name: '', value: '' }]);
  const updateAttribute = (idx: number, patch: Partial<Attribute>) =>
    setAttributes((a) => a.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  const removeAttribute = (idx: number) =>
    setAttributes((a) => a.filter((_, i) => i !== idx));

  // SKUs cell editing
  const updateSkuField = (idx: number, patch: Partial<Sku>) =>
    setSkus((s) => s.map((x, i) => (i === idx ? { ...x, ...patch } : x)));

  const submit = () => {
    setError('');

    // Validate cơ bản
    if (!name.trim()) return setError('Vui lòng nhập tên sản phẩm.');
    if (basePrice < 0) return setError('Giá gốc không hợp lệ.');

    // SKU values phải khớp generate (backend sẽ validate lần nữa)
    const finalSkus =
      variants.length === 0
        ? [
            {
              value: '',
              price: skus[0]?.price ?? basePrice,
              stock: skus[0]?.stock ?? 100,
              image: skus[0]?.image ?? '',
            },
          ]
        : generatedSkuValues.map((v, i) => ({
            value: v,
            price: skus[i]?.price ?? basePrice,
            stock: skus[i]?.stock ?? 100,
            image: skus[i]?.image ?? '',
          }));

    // Gộp parent + child category id
    const categories = [parentCategoryId, childCategoryId].filter(
      Boolean,
    ) as string[];

    // Lookup tên đã chọn (cho payload yêu cầu name)
    const province = provinces.find((p) => p.id === provinceId);
    const district = districts.find((d) => d.id === districtId);
    const ward = wards.find((w) => w.id === wardId);

    if (!province) return setError('Vui lòng chọn tỉnh / thành.');
    if (!district) return setError('Vui lòng chọn quận / huyện.');
    if (!ward) return setError('Vui lòng chọn phường / xã.');

    const payload = {
      name: name.trim(),
      description: description,
      basePrice,
      virtualPrice,
      status,
      brandId: brandId || undefined,
      sizeGuide: sizeGuide || undefined,
      images: existingImages,
      variants,
      skus: finalSkus,
      attributes,
      categories,
      provinceId: province.id,
      provinceName: province.name,
      districtId: district.id,
      districtName: district.name,
      wardId: ward.id,
      wardName: ward.name,
    };

    startTransition(async () => {
      const skuImageUploadInput = Object.entries(newSkuImageBase64ByIndex)
        .map(([rawIndex, base64DataUrl]) => {
          const skuIndex = Number(rawIndex);
          if (!Number.isInteger(skuIndex) || skuIndex < 0) return null;
          const skuValue = finalSkus[skuIndex]?.value ?? '';
          return {
            skuIndex,
            skuValue,
            base64DataUrl,
          };
        })
        .filter(
          (
            item,
          ): item is {
            skuIndex: number;
            skuValue: string;
            base64DataUrl: string;
          } => !!item,
        );

      const result =
        mode === 'create'
          ? await createProductAction(
              payload,
              {
                base64DataUrls: newImageBase64DataUrls,
              },
              skuImageUploadInput,
            )
          : await updateProductAction(
              initial.id!,
              payload,
              {
                base64DataUrls: newImageBase64DataUrls,
              },
              skuImageUploadInput,
            );
      if (!result.ok) {
        setError(result.message ?? 'Đã xảy ra lỗi.');
        return;
      }
      toast.success(
        mode === 'create' ? 'Tạo sản phẩm thành công.' : 'Cập nhật thành công.',
      );
      if (mode === 'create' && result.id) {
        router.push(`/products/${result.id}`);
      } else {
        router.refresh();
      }
    });
  };

  const onDelete = () => {
    if (!initial.id) return;
    if (!confirm('Bạn chắc chắn muốn xoá sản phẩm này?')) return;
    startTransition(async () => {
      try {
        await deleteProductAction(initial.id!);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Xoá thất bại');
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-ink-muted hover:text-primary transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Link>
          <h1 className="text-2xl font-bold text-ink">
            {mode === 'create' ? 'Tạo sản phẩm mới' : 'Chi tiết sản phẩm'}
          </h1>
        </div>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isPending}
            className="btn-outline btn-md text-danger border-red-200 hover:bg-red-50 hover:border-danger disabled:opacity-60"
          >
            <Trash2 className="w-4 h-4" />
            Xoá sản phẩm
          </button>
        )}
      </div>

      {error && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 rounded-md text-sm font-medium bg-red-50 text-danger border border-red-200"
        >
          {error}
        </div>
      )}

      {/* Thông tin chung */}
      <Section title="Thông tin chung">
        <Field label="Tên sản phẩm" required>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Áo thun cotton unisex..."
          />
        </Field>
        <Field label="Mô tả">
          <textarea
            rows={7}
            className="input resize-y min-h-[180px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả chi tiết về sản phẩm..."
          />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Giá gốc (VND)" required>
            <input
              type="number"
              className="input"
              min={0}
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Giá niêm yết (VND)">
            <input
              type="number"
              className="input"
              min={0}
              value={virtualPrice}
              onChange={(e) => setVirtualPrice(Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Trạng thái">
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              <option value={ProductStatusValues.DRAFT}>Nháp</option>
              <option value={ProductStatusValues.ACTIVE}>Đang bán</option>
              <option value={ProductStatusValues.INACTIVE}>Đã ẩn</option>
              <option value={ProductStatusValues.BANNED}>Bị cấm</option>
            </select>
          </Field>
        </div>
        <Field label="Thương hiệu">
          <select
            className="input"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
          >
            <option value="">— Không có thương hiệu —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Danh mục cha">
            <select
              className="input"
              value={parentCategoryId}
              onChange={(e) => {
                setParentCategoryId(e.target.value);
                setChildCategoryId('');
              }}
            >
              <option value="">— Chọn danh mục —</option>
              {rootCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Danh mục con">
            <select
              className="input disabled:bg-surface-muted disabled:cursor-not-allowed"
              value={childCategoryId}
              onChange={(e) => setChildCategoryId(e.target.value)}
              disabled={!parentCategoryId || loadingChildren}
            >
              <option value="">
                {loadingChildren
                  ? 'Đang tải...'
                  : !parentCategoryId
                    ? 'Chọn danh mục cha trước'
                    : childCategories.length === 0
                      ? 'Không có danh mục con'
                      : '— Chọn danh mục con —'}
              </option>
              {childCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Hướng dẫn chọn size">
          <textarea
            rows={5}
            className="input resize-y min-h-[140px]"
            value={sizeGuide}
            onChange={(e) => setSizeGuide(e.target.value)}
            placeholder="Bảng size, cách chọn size phù hợp..."
          />
        </Field>
      </Section>

      {/* Ảnh */}
      <Section
        title="Hình ảnh"
        description="Tải ảnh PNG/JPG/JPEG/WEBP. Ảnh mới sẽ được preview tạm thời trước khi lưu."
      >
        <input
          ref={imageInputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          multiple
          className="hidden"
          onChange={onImageFilesChange}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isPending}
            className="btn-outline btn-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Chọn ảnh để tải lên
          </button>
          <p className="text-xs text-ink-muted">
            Hỗ trợ chọn nhiều ảnh cùng lúc. Ảnh đầu tiên sẽ là ảnh đại diện.
          </p>
        </div>

        {imagePreviewItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
            {imagePreviewItems.map((item) => (
              <div
                key={item.id}
                className="relative rounded border border-slate-200 bg-surface-muted overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt="product-upload-preview"
                  className="w-full aspect-square object-cover"
                />

                <span className="absolute left-2 top-2 text-[11px] px-1.5 py-0.5 rounded bg-white/90 border border-slate-200 text-ink-muted">
                  {item.isNew ? 'Ảnh mới' : 'Ảnh hiện tại'}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    item.isNew
                      ? removeNewImage(item.index)
                      : removeExistingImage(item.index)
                  }
                  className="absolute right-2 top-2 w-7 h-7 rounded-full bg-white/90 border border-slate-200 text-danger hover:bg-red-50 transition-colors duration-200 flex items-center justify-center cursor-pointer"
                  aria-label="Xoá ảnh"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Địa chỉ */}
      <Section
        title="Địa điểm kho hàng"
        description="Chọn tỉnh trước, sau đó chọn quận, rồi chọn phường."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Tỉnh / Thành" required>
            <select
              className="input"
              value={provinceId || ''}
              onChange={(e) => {
                const v = Number(e.target.value) || 0;
                setProvinceId(v);
                setDistrictId(0);
                setWardId(0);
              }}
            >
              <option value="">— Chọn tỉnh / thành —</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quận / Huyện" required>
            <select
              className="input disabled:bg-surface-muted disabled:cursor-not-allowed"
              value={districtId || ''}
              onChange={(e) => {
                const v = Number(e.target.value) || 0;
                setDistrictId(v);
                setWardId(0);
              }}
              disabled={!provinceId || loadingDistricts}
            >
              <option value="">
                {loadingDistricts
                  ? 'Đang tải...'
                  : !provinceId
                    ? 'Chọn tỉnh / thành trước'
                    : '— Chọn quận / huyện —'}
              </option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Phường / Xã" required>
            <select
              className="input disabled:bg-surface-muted disabled:cursor-not-allowed"
              value={wardId || ''}
              onChange={(e) => setWardId(Number(e.target.value) || 0)}
              disabled={!districtId || loadingWards}
            >
              <option value="">
                {loadingWards
                  ? 'Đang tải...'
                  : !districtId
                    ? 'Chọn quận / huyện trước'
                    : '— Chọn phường / xã —'}
              </option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Variants */}
      <Section
        title="Phân loại (Variants)"
        description="Thêm phân loại như Màu, Size... Hệ thống sẽ tự generate SKU theo tổ hợp."
        action={
          <button
            type="button"
            onClick={addVariant}
            className="btn-outline btn-sm"
          >
            <Plus className="w-4 h-4" />
            Thêm phân loại
          </button>
        }
      >
        {variants.length === 0 && (
          <p className="text-sm text-ink-muted italic">
            Chưa có phân loại. Sản phẩm sẽ có duy nhất 1 SKU.
          </p>
        )}
        <div className="space-y-4">
          {variants.map((v, vi) => (
            <div
              key={vi}
              className="rounded-md border border-slate-200 p-4 bg-surface-alt"
            >
              <div className="flex items-center justify-between mb-3 gap-3">
                <input
                  className="input max-w-xs"
                  placeholder="Tên phân loại (VD: Màu sắc)"
                  value={v.value}
                  onChange={(e) => updateVariantName(vi, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeVariant(vi)}
                  className="text-danger hover:bg-red-50 p-1.5 rounded transition-colors"
                  aria-label="Xoá phân loại"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt, oi) => (
                  <div key={oi} className="relative">
                    <input
                      className="input pr-8 w-36"
                      placeholder={`Tuỳ chọn ${oi + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(vi, oi, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(vi, oi)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-danger"
                      aria-label="Xoá tuỳ chọn"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(vi)}
                  className="h-10 px-3 rounded border border-dashed border-slate-300 text-ink-muted hover:text-primary hover:border-primary text-sm transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Thêm tuỳ chọn
                </button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* SKUs */}
      <Section
        title="SKU"
        description={
          variants.length > 0
            ? 'Tự động sinh theo tổ hợp phân loại. Điều chỉnh giá / tồn kho / ảnh cho từng SKU.'
            : 'Sản phẩm không phân loại — 1 SKU duy nhất.'
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt text-ink-muted">
                <th className="py-2 px-3 text-left font-semibold">
                  Giá trị SKU
                </th>
                <th className="py-2 px-3 text-right font-semibold">
                  Giá (VND)
                </th>
                <th className="py-2 px-3 text-right font-semibold">Tồn kho</th>
                <th className="py-2 pl-3 pr-1 text-left font-semibold">
                  Ảnh SKU
                </th>
                <th className="py-2 pl-1 pr-3 text-left font-semibold">
                  Hoàn tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {skus.map((sku, i) => (
                <tr key={`${sku.value}-${i}`}>
                  <td className="py-2 px-3 font-mono text-xs text-ink">
                    {sku.value || <span className="text-ink-subtle">—</span>}
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min={0}
                      className="input text-right"
                      value={sku.price}
                      onChange={(e) =>
                        updateSkuField(i, {
                          price: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min={0}
                      className="input text-right"
                      value={sku.stock}
                      onChange={(e) =>
                        updateSkuField(i, {
                          stock: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td className="py-2 pl-3 pr-1">
                    <input
                      ref={(el) => {
                        skuImageInputRefs.current[i] = el;
                      }}
                      type="file"
                      accept={IMAGE_ACCEPT}
                      className="hidden"
                      onChange={(e) => onSkuImageChange(i, e)}
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded bg-surface-muted border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        {skuImagePreviewOverrides[i] || sku.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={skuImagePreviewOverrides[i] || sku.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-ink-subtle" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => skuImageInputRefs.current[i]?.click()}
                        className="btn-outline btn-sm h-9 px-2.5 cursor-pointer"
                      >
                        Chọn ảnh
                      </button>
                    </div>
                  </td>
                  <td className="py-2 pl-1 pr-3">
                    <button
                      type="button"
                      onClick={() => removeSkuImagePreview(i)}
                      disabled={!skuImagePreviewOverrides[i]}
                      className="h-9 px-2.5 rounded border border-slate-200 text-ink-muted transition-colors duration-200 text-xs disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:text-danger enabled:hover:border-red-200 enabled:hover:bg-red-50"
                    >
                      Hoàn tác ảnh
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Attributes */}
      <Section
        title="Thuộc tính"
        description="Các thuộc tính bổ sung (VD: Chất liệu, Xuất xứ...)."
        action={
          <button
            type="button"
            onClick={addAttribute}
            className="btn-outline btn-sm"
          >
            <Plus className="w-4 h-4" />
            Thêm thuộc tính
          </button>
        }
      >
        {attributes.length === 0 && (
          <p className="text-sm text-ink-muted italic">Chưa có thuộc tính.</p>
        )}
        <div className="space-y-2">
          {attributes.map((a, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                className="input col-span-5"
                placeholder="Tên thuộc tính"
                value={a.name}
                onChange={(e) => updateAttribute(i, { name: e.target.value })}
              />
              <input
                className="input col-span-6"
                placeholder="Giá trị"
                value={a.value}
                onChange={(e) => updateAttribute(i, { value: e.target.value })}
              />
              <button
                type="button"
                onClick={() => removeAttribute(i)}
                className="col-span-1 text-danger hover:bg-red-50 rounded transition-colors flex items-center justify-center"
                aria-label="Xoá thuộc tính"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-5 py-3 -mx-6 flex justify-end gap-3 shadow-card z-10">
        <Link href="/products" className="btn-outline btn-md">
          Huỷ
        </Link>
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="btn-primary btn-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isPending
            ? 'Đang lưu...'
            : mode === 'create'
              ? 'Tạo sản phẩm'
              : 'Cập nhật'}
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          {description && (
            <p className="text-sm text-ink-muted mt-0.5">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink-muted">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
