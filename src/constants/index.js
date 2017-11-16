// 图床前缀
export const prefix = "http://ow5o14n5d.bkt.clouddn.com/";

// 相关图片展示个数
export const relatedCount = 4;

// meta.json地址
// 根据年月选择，避免长期缓存
const d = new Date();
export const metaUrl = `http://ow5o14n5d.bkt.clouddn.com/meta-${d.getFullYear()}-${d.getMonth()+1}.json`;

// 每一列的宽度
export const columnWidth = 250 + 16;