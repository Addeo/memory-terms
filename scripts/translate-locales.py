#!/usr/bin/env python3
"""Generate locale JSON files from English sources (batched Google Translate)."""

from __future__ import annotations

import json
import re
import time
from pathlib import Path

from deep_translator import GoogleTranslator

ROOT = Path(__file__).resolve().parents[1]
LANGS_FILE = ROOT / "locales" / "languages.json"
SEG = "⟦§⟧"
TARGET_MAP = {"zh": "zh-CN"}
SKIP_KEYS = {"metaLastUpdatedIso"}

TAG_PATTERN = re.compile(
    r"(<strong>.*?</strong>|<a\s+[^>]+>.*?</a>|<br\s*/?>)",
    re.IGNORECASE | re.DOTALL,
)


def protect(text: str) -> tuple[str, list[str]]:
    tokens: list[str] = []

    def stash(match: re.Match[str]) -> str:
        tokens.append(match.group(0))
        return f"⟦{len(tokens) - 1}⟧"

    return TAG_PATTERN.sub(stash, text), tokens


def restore(text: str, tokens: list[str]) -> str:
    for i, token in enumerate(tokens):
        text = text.replace(f"⟦{i}⟧", token)
    return text


def collect_strings(value, key: str | None, out: list[str]) -> None:
    if key in SKIP_KEYS:
        return
    if isinstance(value, str):
        out.append(value)
    elif isinstance(value, list):
        for item in value:
            collect_strings(item, None, out)
    elif isinstance(value, dict):
        for k, v in value.items():
            collect_strings(v, k, out)


def assign_strings(value, key: str | None, it: iter) -> object:
    if key in SKIP_KEYS:
        return value
    if isinstance(value, str):
        return next(it)
    if isinstance(value, list):
        return [assign_strings(item, None, it) for item in value]
    if isinstance(value, dict):
        return {k: assign_strings(v, k, it) for k, v in value.items()}
    return value


def translate_batch(strings: list[str], target: str) -> list[str]:
    if not strings:
        return []
    code = TARGET_MAP.get(target, target)
    protected_blocks: list[tuple[str, list[str]]] = [protect(s) for s in strings]
    results: list[str] = []
    chunk_blocks: list[tuple[str, list[str]]] = []
    chunk_len = 0

    def flush() -> None:
        nonlocal chunk_blocks, chunk_len
        if not chunk_blocks:
            return
        payload = SEG.join(block[0] for block in chunk_blocks)
        translated = GoogleTranslator(source="en", target=code).translate(payload)
        parts = translated.split(SEG)
        if len(parts) != len(chunk_blocks):
            parts = [
                restore(
                    GoogleTranslator(source="en", target=code).translate(block[0]),
                    block[1],
                )
                for block in chunk_blocks
            ]
        else:
            parts = [restore(parts[i], chunk_blocks[i][1]) for i in range(len(parts))]
        results.extend(parts)
        chunk_blocks = []
        chunk_len = 0

    for block in protected_blocks:
        addition = len(block[0]) + len(SEG)
        if chunk_blocks and chunk_len + addition > 4200:
            flush()
            time.sleep(0.2)
        chunk_blocks.append(block)
        chunk_len += addition
    flush()
    return results


def translate_file(src: Path, dest: Path, target: str) -> None:
    data = json.loads(src.read_text(encoding="utf-8"))
    strings: list[str] = []
    collect_strings(data, None, strings)
    translated_strings = translate_batch(strings, target)
    result = assign_strings(data, None, iter(translated_strings))
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"  {dest.relative_to(ROOT)} ({len(strings)} strings)")


def main() -> None:
    languages = json.loads(LANGS_FILE.read_text(encoding="utf-8"))
    codes = [lang["code"] for lang in languages if lang["code"] != "en"]

    pairs = [
        (ROOT / "locales" / "terms" / "en.json", ROOT / "locales" / "terms"),
        (ROOT / "locales" / "privacy" / "en.json", ROOT / "locales" / "privacy"),
        (ROOT / "locales" / "ui" / "en.json", ROOT / "locales" / "ui"),
    ]

    for code in codes:
        print(f"\n=== {code} ===")
        for src, out_dir in pairs:
            translate_file(src, out_dir / f"{code}.json", code)
            time.sleep(0.35)
    print("\nDone.")


if __name__ == "__main__":
    main()
