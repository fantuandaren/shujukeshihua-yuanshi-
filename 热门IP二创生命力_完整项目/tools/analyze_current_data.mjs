global.window = {};
await import('../dist/real-data.js');
const all = window.REAL_DATA;
const unique = all.filter(d => !d.id.startsWith('source-'));
const sourceRows = all.filter(d => d.purpose === '来源对比');
const typeRows = unique.filter(d => d.purpose === '类型分析');
const ips = ['奶龙', 'Loopy', '吉伊卡哇'];
const months = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
const types = ['配音改编', '混剪/鬼畜', '表情包/梗图', 'AI生成'];
const median = values => {
  const a = values.filter(Number.isFinite).sort((x, y) => x - y);
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};
const mean = values => values.length ? values.reduce((a,b)=>a+b,0)/values.length : null;
const rate = rows => rows.length ? rows.reduce((s,d)=>s+d.coins+d.favorites,0) / rows.reduce((s,d)=>s+d.views,0) : null;
const cv = values => { const m=mean(values); return m ? Math.sqrt(mean(values.map(v=>(v-m)**2)))/m : null; };
const f = n => n == null ? null : Math.round(n);
const p = n => n == null ? null : +(n*100).toFixed(2);

const result = {counts:{unique:unique.length,official:unique.filter(d=>d.source==='官方').length,ugc:unique.filter(d=>d.source==='用户二创').length},ips:{},types:{},months:{}};
for (const ip of ips) {
  const source = sourceRows.filter(d=>d.ip===ip);
  const official = source.filter(d=>d.source==='官方');
  const ugc = source.filter(d=>d.source==='用户二创');
  const ownTypes = typeRows.filter(d=>d.ip===ip);
  result.ips[ip] = {
    officialMedian:f(median(official.map(d=>d.views))),
    ugcMedian:f(median(ugc.map(d=>d.views))),
    ugcVsOfficial:+(median(ugc.map(d=>d.views))/median(official.map(d=>d.views))).toFixed(2),
    officialCoreRate:p(rate(official)),
    ugcCoreRate:p(rate(ugc)),
    typeBreakdown:Object.fromEntries(types.map(type=>{const r=ownTypes.filter(d=>d.type===type);return [type,{n:r.length,median:f(median(r.map(d=>d.views))),coreRate:p(rate(r)),monthlyCV:+(cv(months.map(m=>mean(r.filter(d=>d.month===m).map(d=>d.views))).filter(Number.isFinite))||0).toFixed(2)}]})),
    monthly:Object.fromEntries(months.map(m=>{const o=official.filter(d=>d.month===m),u=ugc.filter(d=>d.month===m);return [m,{officialMean:f(mean(o.map(d=>d.views))),ugcMean:f(mean(u.map(d=>d.views))),ratio:+(mean(u.map(d=>d.views))/mean(o.map(d=>d.views))).toFixed(2)}]}))
  };
}
for (const type of types) {
  const r=typeRows.filter(d=>d.type===type);
  result.types[type]={n:r.length,median:f(median(r.map(d=>d.views))),mean:f(mean(r.map(d=>d.views))),coreRate:p(rate(r)),likeRate:p(r.reduce((s,d)=>s+d.likes,0)/r.reduce((s,d)=>s+d.views,0)),topIp:ips.map(ip=>{const x=r.filter(d=>d.ip===ip);return {ip,n:x.length,median:f(median(x.map(d=>d.views))),coreRate:p(rate(x))}}).sort((a,b)=>b.median-a.median)};
}
for (const month of months) {
  const r=typeRows.filter(d=>d.month===month);
  result.months[month]={n:r.length,mean:f(mean(r.map(d=>d.views))),median:f(median(r.map(d=>d.views))),coreRate:p(rate(r))};
}
console.log(JSON.stringify(result,null,2));
