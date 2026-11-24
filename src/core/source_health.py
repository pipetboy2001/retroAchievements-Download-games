"""
Logica para el chequeo periodico de salud de las fuentes de descarga: por
cada consola, toma una muestra al azar de ROMs y prueba si su URL real
(la que generaria la app) responde. Separado de scripts/check_sources_health.py
(el CLI) para poder testear la logica pura -- agrupacion y umbral -- sin
pegarle a la red.
"""

import json
import random
from collections import Counter, defaultdict
from typing import Dict, List, Tuple

import config

from ..factories.url_factory import URLGeneratorFactory
from .link_checker import download_url_failure
from .rom_info import get_console_from_rom_path


def group_roms_by_console(data: dict) -> Dict[str, List[str]]:
    """{consola: [rom_path, ...]} a partir de la estructura cruda de
    TamperMonkeyRetroachievements.json ({game_id: [{hash: rom_path}, ...]})."""
    roms: Dict[str, List[str]] = defaultdict(list)
    for versions in data.values():
        for entry in versions:
            for rom_path in entry.values():
                roms[get_console_from_rom_path(rom_path)].append(rom_path)
    return roms


def _status(reachable: int, gone: int, threshold: float) -> Tuple[str, float]:
    """Solo cuenta respuestas definitivas (alcanzable vs 404/410): un timeout
    no prueba que el archivo no exista. archive.org le responde lento a los
    runners de GitHub en items grandes (GameCube: 11/15 ReadTimeout en CI,
    255/255 OK desde afuera), y eso marcaba la consola como ROTA sin estarlo."""
    total = reachable + gone
    if not total:
        return "SIN RESPUESTA", 0.0
    pct = reachable / total
    return ("OK" if pct >= threshold else "ROTO"), pct


def _reasons(failures: Counter) -> str:
    return " (fallos: " + ", ".join(f"{r} x{n}" for r, n in failures.most_common()) + ")" if failures else ""


def run(sample_size: int = 15, threshold: float = 0.5) -> Tuple[str, bool]:
    """Devuelve (reporte en texto, hay_alguna_rota)."""
    with open(config.JSON_FILE_PATH, encoding="utf-8") as f:
        data = json.load(f)
    roms_by_console = group_roms_by_console(data)

    lines = []
    any_broken = False
    for console in sorted(roms_by_console):
        # shortcut: consolas con pocas ROMs quedan con una muestra chica (mas
        # ruidosa); si eso da falsos positivos seguidos, subir sample_size.
        candidates = roms_by_console[console]
        sample = random.sample(candidates, min(sample_size, len(candidates)))
        failures = Counter(download_url_failure(URLGeneratorFactory.generate_url(rom_path)) for rom_path in sample)
        reachable = failures.pop(None, 0)
        gone = failures["404"] + failures["410"]
        status, _ = _status(reachable, gone, threshold)
        if status == "ROTO":
            any_broken = True
        lines.append(f"- {console}: {reachable}/{len(sample)} alcanzables -- {status}{_reasons(failures)}")

    return "\n".join(lines), any_broken


if __name__ == "__main__":
    assert _status(8, 2, 0.5) == ("OK", 0.8)
    assert _status(2, 8, 0.5) == ("ROTO", 0.2)
    assert _status(0, 0, 0.5) == ("SIN RESPUESTA", 0.0)
    assert _status(4, 0, 0.5) == ("OK", 1.0)  # GameCube en CI: 4 OK + 11 timeouts
    assert _reasons(Counter()) == ""
    assert _reasons(Counter({"ReadTimeout": 3, "404": 1})) == " (fallos: ReadTimeout x3, 404 x1)"

    fixture = {
        "1": [{"HASHA": "SNES-Super Famicom/Game/Game (U).sfc"}],
        "2": [{"HASHB": "PlayStation 2/A-M/Game (U).iso"}],
    }
    grouped = group_roms_by_console(fixture)
    assert grouped["SNES"] == ["SNES-Super Famicom/Game/Game (U).sfc"]
    assert grouped["PS2"] == ["PlayStation 2/A-M/Game (U).iso"]

    print("source_health smoke check: OK")
