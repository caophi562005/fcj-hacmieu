import { getManyAttributes } from '../../../lib/admin-catalog';
import { AttributeCreateForm, AttributeGrid } from './ui';

export default async function AttributesPage() {
  const data = await getManyAttributes({ page: 1, limit: 100 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Quản lý thuộc tính</h1>
        <p className="text-ink-muted text-sm mt-1">
          Tổng cộng {data.totalItems} thuộc tính.
        </p>
      </div>

      <AttributeCreateForm />

      <AttributeGrid
        attributes={data.attributes.map((attribute) => ({
          id: attribute.id,
          name: attribute.name,
        }))}
      />
    </div>
  );
}
