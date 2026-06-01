// 预处理：把 english-vocabulary/*.json 切成按书分片的小文件
// 输入：../english-vocabulary/{tb_book,tb_vocabulary,tb_voc_book}.json
// 输出：public/data/books.json + public/data/book-{id}.json
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '../../english-vocabulary');
const OUT = resolve(__dirname, '../public/data');
const EXTRA = resolve(__dirname, '../extra');

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

console.log('reading source files...');
const books = JSON.parse(readFileSync(resolve(SRC, 'tb_book.json'), 'utf8'));
const vocab = JSON.parse(readFileSync(resolve(SRC, 'tb_vocabulary.json'), 'utf8'));
const vocBook = JSON.parse(readFileSync(resolve(SRC, 'tb_voc_book.json'), 'utf8'));

const vocabById = new Map();
for (const v of vocab) vocabById.set(v.wordid, v);

// 收集所有词书（内置 + extra），最后统一排序输出 books.json
const allBooks = books.map(b => ({
  bookid: b.bookid,
  bookname: b.bookname,
  voccount: b.voccount,
  priority: 0
}));

// 按 bookid 分组
const grouped = new Map();
for (const r of vocBook) {
  if (!grouped.has(r.bookid)) grouped.set(r.bookid, []);
  grouped.get(r.bookid).push(r.wordid);
}

for (const b of books) {
  const ids = grouped.get(b.bookid) || [];
  const words = ids
    .map(id => vocabById.get(id))
    .filter(Boolean)
    .map(v => ({
      id: v.wordid,
      w: v.spelling,
      uk: v.UKphonetic || '',
      us: v.USphonetic || '',
      m: v.paraphrase || '',
      f: v.frequency || 0
    }));
  const file = resolve(OUT, `book-${b.bookid}.json`);
  writeFileSync(file, JSON.stringify(words));
  console.log(`book-${b.bookid}.json -> ${words.length} words (${b.bookname})`);
}

// 处理 extra/ 下的额外词书：直接复制 JSON 作为 book-{id}.json
const extraIndexFile = resolve(EXTRA, 'index.json');
if (existsSync(extraIndexFile)) {
  const extras = JSON.parse(readFileSync(extraIndexFile, 'utf8'));
  const seenIds = new Set(allBooks.map(b => b.bookid));
  for (const e of extras) {
    if (seenIds.has(e.bookid)) {
      throw new Error(`extra bookid ${e.bookid} 与内置/已有冲突，请改用别的 bookid`);
    }
    seenIds.add(e.bookid);
    const src = resolve(EXTRA, e.file);
    const words = JSON.parse(readFileSync(src, 'utf8'));
    const dst = resolve(OUT, `book-${e.bookid}.json`);
    writeFileSync(dst, JSON.stringify(words));
    allBooks.push({
      bookid: e.bookid,
      bookname: e.bookname,
      voccount: words.length,
      priority: e.priority || 0
    });
    console.log(`book-${e.bookid}.json -> ${words.length} words (extra: ${e.bookname})`);
  }
}

// priority 大的在前，同 priority 按 bookid 升序
allBooks.sort((a, b) => (b.priority - a.priority) || (a.bookid - b.bookid));

writeFileSync(
  resolve(OUT, 'books.json'),
  JSON.stringify(allBooks.map(b => ({ bookid: b.bookid, bookname: b.bookname, voccount: b.voccount })), null, 0)
);
console.log(`books.json -> ${allBooks.length} books`);

console.log('done.');
