import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDirectory, '..');
const configurationPath = resolve(
  workspaceRoot,
  'libs/configurations/src/lib/database-demo.config.ts',
);

const demos = {
  0: { value: 'none', name: 'Tắt toàn bộ demo lỗi' },
  1: { value: '5.1', name: 'Lost Update - ví người dùng' },
  2: { value: '5.2', name: 'Dirty Read - thanh toán' },
  3: { value: '5.3', name: 'Non-repeatable Read - SKU' },
  4: { value: '5.4', name: 'Phantom Read - danh sách đơn hàng' },
  5: { value: '5.5', name: 'Deadlock - hoàn kho SKU' },
};

const aliases = new Map(
  Object.entries(demos).flatMap(([choice, demo]) => [
    [choice, demo],
    [demo.value, demo],
  ]),
);

async function askForDemo() {
  const argument = process.argv[2]?.trim();
  if (argument) return argument;

  const prompt = [
    '',
    'Chọn kịch bản cơ sở dữ liệu muốn demo:',
    ...Object.entries(demos).map(
      ([choice, demo]) =>
        `  ${choice}. ${demo.value === 'none' ? '' : `${demo.value} - `}${demo.name}`,
    ),
    '',
  ].join('\n');

  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    return (await readline.question(`${prompt}Nhập lựa chọn [0-5]: `)).trim();
  } finally {
    readline.close();
  }
}

const choice = await askForDemo();
const selectedDemo = aliases.get(choice);

if (!selectedDemo) {
  console.error(`Lựa chọn "${choice}" không hợp lệ. Hãy chọn từ 0 đến 5.`);
  process.exitCode = 1;
} else {
  const source = await readFile(configurationPath, 'utf8');
  const pattern =
    /export const ACTIVE_DATABASE_DEMO: DatabaseDemo = '(?:none|5\.[1-5])';/g;
  const matches = source.match(pattern) ?? [];

  if (matches.length !== 1) {
    throw new Error(
      `Không thể cập nhật cấu hình an toàn: tìm thấy ${matches.length} khai báo ACTIVE_DATABASE_DEMO.`,
    );
  }

  const updatedSource = source.replace(
    pattern,
    `export const ACTIVE_DATABASE_DEMO: DatabaseDemo = '${selectedDemo.value}';`,
  );
  await writeFile(configurationPath, updatedSource, 'utf8');

  console.log('');
  console.log(`Đã chọn: ${selectedDemo.value} - ${selectedDemo.name}`);
  console.log(
    selectedDemo.value === 'none'
      ? 'Tất cả kịch bản hiện dùng code đúng.'
      : `Chỉ lỗi ${selectedDemo.value} được bật; bốn kịch bản còn lại dùng code đúng.`,
  );
  console.log(
    'Nếu đang chạy pnpm dev, hãy chờ Nx build lại service liên quan.',
  );
}
