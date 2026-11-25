import json
from pathlib import Path
import openpyxl

SOURCE = Path(r"C:\Users\FTY\Desktop\B站热门IP数据采集表_吉伊卡哇.xlsx")
OUTPUT = Path(r"C:\Users\FTY\Desktop\关于\ip-spread-lab\dist\real-data.js")

book = openpyxl.load_workbook(SOURCE, data_only=False)
sheet = book.worksheets[1]
headers = [sheet.cell(6, c).value for c in range(1, 27)]
ip_keys = {"奶龙": "nailong", "Loopy": "loopy", "吉伊卡哇": "chiikawa"}
colors = {"奶龙": "#ffd34f", "Loopy": "#ff7da6", "吉伊卡哇": "#bdeaf1"}

def number(value):
    if value in (None, ""):
        return None
    return int(value)

rows = []
for row_no in range(7, sheet.max_row + 1):
    raw = {headers[c - 1]: sheet.cell(row_no, c).value for c in range(1, 27)}
    if raw["播放量"] in (None, ""):
        continue
    ip = raw["IP"]
    record = {
        "id": f"real-{raw['任务编号']}",
        "purpose": "来源对比" if raw["数据角色"] == "官方头部" else "类型分析",
        "rank": number(raw["类型内播放排名"]),
        "ip": ip,
        "ipKey": ip_keys[ip],
        "color": colors[ip],
        "month": str(raw["月份"]),
        "source": raw["内容来源"],
        "type": raw["二创类型"],
        "title": f"{ip} · {str(raw['月份'])[-2:]}月 · {raw['二创类型']}",
        "views": number(raw["播放量"]),
        "likes": number(raw["点赞数"]) or 0,
        "coins": number(raw["投币数"]) or 0,
        "favorites": number(raw["收藏数"]) or 0,
        "comments": number(raw["评论数"]),
        "commentStatus": raw["评论区状态"] or "正常",
        "dataOrigin": "真实采集",
    }
    rows.append(record)

# 每个 IP、每个月，从全部有效二创中按播放量选 Top3，作为官方与二创的同口径来源对比。
for ip in ip_keys:
    for month in sorted({r["month"] for r in rows}):
        candidates = [
            r for r in rows
            if r["ip"] == ip and r["month"] == month and r["source"] == "用户二创"
        ]
        candidates.sort(key=lambda r: r["views"], reverse=True)
        for rank, source in enumerate(candidates[:3], 1):
            duplicate = dict(source)
            duplicate["id"] = f"source-{source['id']}"
            duplicate["purpose"] = "来源对比"
            duplicate["rank"] = rank
            rows.append(duplicate)

OUTPUT.write_text(
    "window.REAL_DATA=" + json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + ";\n",
    encoding="utf-8",
)
print(json.dumps({
    "valid_unique_videos": sum(1 for r in rows if not r["id"].startswith("source-")),
    "analytic_records": len(rows),
    "by_ip": {ip: sum(1 for r in rows if r["ip"] == ip and not r["id"].startswith("source-")) for ip in ip_keys},
}, ensure_ascii=False))
