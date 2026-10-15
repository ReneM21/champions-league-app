// Sonda temporal: busca en Commons fotos libres de cuando jugaban y descarga miniaturas para elegir.
const fs = require('fs');
const path = require('path');
const H = { 'User-Agent': 'champions-league-app (https://github.com/ReneM21/champions-league-app)' };
const api = async (host, params) => (await fetch(`https://${host}/w/api.php?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`, { headers: H })).json();
const PLAYERS = { 'david-beckham': ['Q10520', 1994, 2013, ['David Beckham Real Madrid', 'David Beckham Galaxy', 'David Beckham Milan', 'David Beckham England', 'David Beckham PSG']], xavi: ['Q17500', 1998, 2015, ['Xavi Hernández Barcelona', 'Xavi Barcelona', 'Xavi Spain', 'Xavi Hernandez']] };
const OUT = 'probe-photos2';

async function filesIn(category, depth) {
  const files = new Set();
  let cont = {};
  do {
    const r = await api('commons.wikimedia.org', { action: 'query', list: 'categorymembers', cmtitle: category, cmlimit: '500', cmtype: 'file|subcat', ...cont });
    for (const m of r.query.categorymembers) {
      if (m.ns === 6) files.add(m.title);
      else if (m.ns === 14 && depth > 0) for (const f of await filesIn(m.title, depth - 1)) files.add(f);
    }
    cont = r.continue || {};
  } while (cont.cmcontinue);
  return files;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const report = {};
  for (const [id, [qid, from, to, searches]] of Object.entries(PLAYERS)) {
    const wd = await api('www.wikidata.org', { action: 'wbgetentities', ids: qid, props: 'claims' });
    const cat = wd.entities[qid].claims.P373?.[0]?.mainsnak?.datavalue?.value;
    const found = await filesIn(`Category:${cat}`, 2);
    for (const q of searches) {
      const r = await api('commons.wikimedia.org', { action: 'query', list: 'search', srnamespace: '6', srlimit: '100', srsearch: q });
      for (const hit of r.query.search) found.add(hit.title);
    }
    const files = [...found].filter((f) => /\.jpe?g$/i.test(f));
    const infos = [];
    for (let i = 0; i < files.length; i += 40) {
      const r = await api('commons.wikimedia.org', { action: 'query', prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: '300', titles: files.slice(i, i + 40).join('|') });
      for (const p of r.query.pages) {
        const ii = p.imageinfo?.[0]; if (!ii) continue;
        const m = ii.extmetadata || {};
        const date = (m.DateTimeOriginal?.value || m.DateTime?.value || '').replace(/<[^>]+>/g, '');
        const year = Number((date.match(/(19|20)\d{2}/) || [])[0]);
        const license = (m.LicenseShortName?.value || '').replace(/<[^>]+>/g, '');
        if (!year || year < from || year > to || !license) continue;
        infos.push({ title: p.title, year, w: ii.width, h: ii.height, thumb: ii.thumburl, license });
      }
    }
    // Retratos primero (más alto que ancho), luego por tamaño
    infos.sort((a, b) => (b.h >= b.w * 0.9) - (a.h >= a.w * 0.9) || b.w * b.h - a.w * a.h);
    const picks = infos.slice(0, 32);
    report[id] = { category: cat, total: files.length, inCareer: infos.length, picks: picks.map((p, i) => ({ n: i, ...p })) };
    fs.mkdirSync(path.join(OUT, id), { recursive: true });
    for (const [i, p] of picks.entries()) {
      const res = await fetch(p.thumb, { headers: H });
      if (res.ok) fs.writeFileSync(path.join(OUT, id, `${i}.jpg`), Buffer.from(await res.arrayBuffer()));
    }
    console.log(id, cat, files.length, 'archivos;', infos.length, 'de su época');
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
})();
