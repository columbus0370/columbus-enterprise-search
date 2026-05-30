export const formatSales = (yen) => {
  if (!yen && yen !== 0) return '非公開';
  if (yen >= 100_000_000) return `${(yen / 100_000_000).toFixed(1)}億円`;
  if (yen >= 10_000) return `${Math.floor(yen / 10_000)}万円`;
  return `${yen.toLocaleString()}円`;
};

export const formatEmployees = (n) => {
  if (!n && n !== 0) return '非公開';
  return `${n.toLocaleString()}名`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '不明';
  return new Date(dateStr).toLocaleDateString('ja-JP');
};

export const formatTimestamp = (ts) => {
  return new Date(ts).toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const PREFECTURES = [
  '全国', '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];
