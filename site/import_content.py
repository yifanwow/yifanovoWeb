"""Import original writing and local images without changing either source repo."""
from pathlib import Path
from datetime import datetime
import argparse
import hashlib
import json
import re
import shutil
from urllib.parse import quote

SITE = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=SITE.parent.parent / 'esilhmt')
    args = parser.parse_args()
    source = args.source.resolve()
    if not (source / 'README.md').is_file():
        parser.error('Please provide the esilhmt checkout with --source.')
    assets = SITE / 'assets'
    assets.mkdir(exist_ok=True)
    image_map = {}
    for path in sorted((source / 'images').rglob('*')):
        if path.suffix.lower() not in {'.png', '.jpg', '.jpeg', '.jfif', '.webp'}:
            continue
        filename = hashlib.sha256(str(path.relative_to(source)).encode()).hexdigest()[:12] + path.suffix.lower()
        shutil.copy2(path, assets / filename)
        image_map[str(path.relative_to(source))] = '/assets/' + filename

    def rewrite_image(match):
        raw = match.group(0)
        key = 'images/' + raw.split('images/', 1)[1]
        return image_map.get(key, raw)

    def load(path, kind):
        raw = path.read_text(encoding='utf-8').strip()
        if not raw:
            return None
        dates = re.findall(r'^\s*(\d{1,2}/\d{1,2}/\d{4})\s*$', raw, re.M)
        date = None
        for candidate in reversed(dates):
            try:
                date = datetime.strptime(candidate, '%m/%d/%Y').strftime('%Y-%m-%d')
                break
            except ValueError:
                continue
        if not date:
            date = datetime.strptime(path.stem, '%m-%d-%Y').strftime('%Y-%m-%d')
        body = re.sub(r'^\s*\d{1,2}/\d{1,2}/\d{4}\s*$', '', raw, flags=re.M).strip()
        body = re.sub(r'(?:\.\./)*images/[^\s\)\"<>]+', rewrite_image, body)
        body = re.sub(r'<audio\b.*?</audio>', '', body, flags=re.S | re.I)
        body = re.sub(r'<a\s+href="[^\"]*audio/([^\"]+)"[^>]*>(.*?)</a>', lambda m: '[' + m[2] + '](https://github.com/yifanwow/esilhmt/blob/main/audio/' + quote(m[1]) + ')', body, flags=re.S)
        lines = [line.strip().rstrip('，。！？：、；') for line in body.splitlines() if line.strip() and not line.lstrip().startswith(('#', '!', '<', '>', '[', '---'))]
        title = date if kind == 'poetry' else path.stem
        if re.fullmatch(r'\d{2}-\d{2}-\d{4}', title):
            title = lines[0]
        plain = re.sub(r'<[^>]*>|!\[[^\]]*\]\([^)]*\)|\[[^\]]*\]\([^)]*\)', '', body)
        plain = re.sub(r'[*#>`]', '', plain)
        excerpt_lines = [line.strip() for line in plain.splitlines() if line.strip()]
        return {
            'id': date if kind == 'poetry' else kind + '-' + date,
            'kind': kind, 'title': title, 'date': date, 'year': date[:4],
            'body': body, 'excerpt': '\n'.join(excerpt_lines[:3]) if kind == 'poetry' else ''.join(excerpt_lines)[:110],
            'source': 'https://github.com/yifanwow/esilhmt/blob/main/' + quote(str(path.relative_to(source))),
        }

    poems, articles, seen = [], [], set()
    for folder, kind in [('「无关风月」Poetry', 'poetry'), ('「白马非马」Reflection', 'essay'), ('「南风过境」Story', 'story'), ('「随遇而安」Line', 'note'), ('十二月的晚安', 'letter')]:
        for path in sorted((source / folder).rglob('*.md')):
            if path.name.lower() == 'readme.md' or not path.read_text().strip():
                continue
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            if digest in seen:
                continue
            seen.add(digest)
            work = load(path, kind)
            (poems if kind == 'poetry' else articles).append(work)

    photo_specs = [
        ('poetry/12-17-2021-2.jpg', '破晓时分', '哥伦布', '2021-12-17', '第一次和她一起看的日出。'),
        ('poetry/日食2.png', '日月相遇', '纽约', '2024-04-08', '时间牵引着日月星辰。'),
        ('06282018.jfif', '灯火阑珊', '', '2018-06-28', '城市的灯火，就像天上的繁星散落在人间。'),
        ('poetry/12-17-2021.jpg', '清晨的夜空', '哥伦布', '2021-12-17', '天还未亮。'),
        ('天台06282018.jfif', '教学楼的天台', '', '2018-06-28', '抬头，看向远方。'),
        ('poetry/日食1.png', '光的片刻', '纽约', '2024-04-08', '日食景观。'),
    ]
    photos = [dict(id=str(i), src=image_map['images/' + p], title=t, location=place, date=d, caption=c) for i, (p, t, place, d, c) in enumerate(photo_specs)]
    # Projects, newest first. Old-site projects copy their screenshots; Mne and watchDog images were captured
    # from their own sites and already live in assets/.
    projects = [
        {
                "id": "mne",
                "title": "Mne",
                "category": "iOS · 照片",
                "year": 2026,
                "featured": True,
                "status": "App Store 预购中",
                "tagline": "记忆的碎片，触手可及。",
                "description": "一款整理照片的 iPhone 应用。按自己的节奏重温照片：留下一张，或先放到一边；每一个小小的选择，都会慢慢累积成看得见的成长。名字取自记忆女神 Mnemosyne。",
                "image": "/assets/project-mne.jpg",
                "url": "https://mne.yifanovo.com",
                "links": [
                        {
                                "label": "官网",
                                "href": "https://mne.yifanovo.com"
                        }
                ]
        },
        {
                "id": "watchdog",
                "title": "watchDog",
                "category": "Windows · 内存",
                "year": 2026,
                "featured": True,
                "status": "Windows 10 / 11",
                "tagline": "轻装守护，性能归你。",
                "description": "轻量的 Windows 内存异常追踪工具。持续记录各个进程的内存走势，按增长速度与长期趋势识别疑似泄漏，并能直接处置。窗口常驻只占约 50 MB 内存、0.1% CPU。",
                "image": "/assets/project-watchdog.jpg",
                "url": "https://watchdog.yifanovo.com",
                "links": [
                        {
                                "label": "官网",
                                "href": "https://watchdog.yifanovo.com"
                        },
                        {
                                "label": "GitHub",
                                "href": "https://github.com/yifanwow/watchDog"
                        }
                ]
        },
        {
                "id": "nsv",
                "title": "Night Screen Viewer",
                "category": "Windows · 专注",
                "year": 2024,
                "description": "让其他显示器安静下来。在全屏使用某个应用时，调暗其他屏幕，减少光线与信息的干扰。",
                "image": "/assets/project-nsv.png",
                "url": "https://github.com/yifanwow/NightScreenViewer",
                "links": [
                        {
                                "label": "GitHub",
                                "href": "https://github.com/yifanwow/NightScreenViewer"
                        }
                ]
        },
        {
                "id": "sgpt",
                "title": "s/GPT",
                "category": "Windows · AI 工具",
                "year": 2024,
                "description": "把截图和问题交给 AI，尝试更快捷地解决电脑使用中遇到的疑问与报错。",
                "image": "/assets/project-sgpt.png",
                "url": "https://github.com/yifanwow/sGPT",
                "links": [
                        {
                                "label": "GitHub",
                                "href": "https://github.com/yifanwow/sGPT"
                        }
                ]
        },
        {
                "id": "saio",
                "title": "s/AIO",
                "category": "Web · Steam",
                "year": 2024,
                "description": "一个属于自己游戏库的工作台。通过 Steam 登录，整理游戏、添加标签、评分和更换海报。",
                "image": "/assets/project-saio.png",
                "url": "https://github.com/yifanwow/saio",
                "links": [
                        {
                                "label": "GitHub",
                                "href": "https://github.com/yifanwow/saio"
                        }
                ]
        },
        {
                "id": "fanctrl",
                "title": "fanCtrl",
                "category": "Windows · 硬件",
                "year": 2024,
                "description": "用快捷方式管理风扇和水泵的速度，把日常硬件控制变得更直接。",
                "image": "/assets/project-fanctrl.png",
                "url": "https://github.com/yifanwow/fanCtrl",
                "links": [
                        {
                                "label": "GitHub",
                                "href": "https://github.com/yifanwow/fanCtrl"
                        }
                ]
        },
        {
                "id": "grid",
                "title": "Grid View Engine",
                "category": "Windows · Steam",
                "year": 2023,
                "description": "为 Steam 游戏库更换海报，让收藏的游戏拥有自己喜欢的模样。",
                "image": "/assets/project-grid.jpg",
                "url": "https://github.com/yifanwow/Grid_view_Engine",
                "links": [
                        {
                                "label": "GitHub",
                                "href": "https://github.com/yifanwow/Grid_view_Engine"
                        }
                ]
        }
]
    old_images = {'saio': 'saio.png', 'nsv': 'nsv.png', 'fanctrl': 'fanCtrl.png', 'sgpt': 'sGPT.png', 'grid': 'store_home_share.jpg'}
    for p in projects:
        if p['id'] in old_images:
            shutil.copy2(SITE.parent / 'yifanovo_web/public/img' / old_images[p['id']], assets / Path(p['image']).name)
    project_data = projects
    data = dict(poems=sorted(poems, key=lambda x: x['date'], reverse=True), articles=sorted(articles, key=lambda x: x['date'], reverse=True), photos=photos, projects=project_data)
    (SITE / 'content.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    print(f'Imported {len(poems)} poems, {len(articles)} prose works, {len(photos)} photographs, {len(project_data)} projects.')


if __name__ == '__main__':
    main()
