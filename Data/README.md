# Data

Los datos de los que vive todo el proyecto: la web (`api/index.py`), la app de consola y los scripts de `scripts/`.

## Archivos que usa la app

| Archivo | Qué es | Quién lo genera |
|---|---|---|
| `TamperMonkeyRetroachievements.json` | **El catálogo.** `{ "<GameID de RA>": [ { "<HASH>": "<rom_path>" } ] }`. La carpeta raíz del `rom_path` define la consola (`SNES-Super Famicom/...`, `PlayStation 2/...`) y, junto con `src/factories/url_factory.py`, de él sale la URL de descarga. El nombre es histórico: los datos originales vinieron de un script de Tampermonkey. | A mano o con `scripts/sync_gamecube.py` / `scripts/sync_wii.py` (ver [la guía para agregar juegos](../docs/agregar-fuente-de-juegos.md)) |
| `retroachievements_metadata.json` | Carátula, título oficial y cantidad de logros de cada juego, íconos de consola y los hashes que RetroAchievements reconoce (la etiqueta "reconocido por RA"). **No se actualiza solo:** correr el script después de tocar el catálogo, si no los juegos nuevos salen sin carátula. | `scripts/sync_games_metadata.py` (necesita `API_KEY` en `.env`) |
| `snes_source_override.json` | `rom_path → archivo en la colección nueva`. La colección original de SNES en archive.org murió; la de reemplazo (`retroachievementscompatibleromsSNES`) usa otros nombres. El mapeo se armó comparando **hashes**, no nombres. Los `rom_path` del catálogo se dejan como estaban (de ahí sale el nombre del juego que muestra la web) y `SNESURLGenerator` traduce a la fuente nueva. | `scripts/sync_source.py --console SNES --item retroachievementscompatibleromsSNES` |

## Listas de faltantes (`*_missing_sources.txt`)

La app **no las lee**. Son hashes que RetroAchievements reconoce pero para los que no se encontró ninguna ROM en archive.org cuando se sincronizó esa consola. Esos hashes **no están en el catálogo**: o se borraron al morir la fuente (SNES) o nunca se dieron de alta (GameCube, Wii).

| Archivo | Faltantes | Contexto |
|---|---|---|
| `snes_missing_sources.txt` | 327 | Sin match en la colección nueva de SNES. Muchos son hacks y versiones MSU-1. |
| `wii_missing_sources.txt` | 233 | Sobre todo discos (169 `.rvz`/`.iso`); 64 son canales WiiWare (`.wad`). |
| `gamecube_missing_sources.txt` | 30 | |

Formato: una línea por hash, separada por tabs: `nombre<TAB>rom_path<TAB>hash`.

### ¿Tenés o encontraste alguno de estos juegos?

Es la mejor forma de ayudar: cada línea es un juego (o una versión) con logros que hoy no se puede descargar desde CheevosRoms.

1. Buscá el hash de la lista en un item de archive.org (o verificá un archivo tuyo con **Verificar ROM** en la web, que calcula el hash en el navegador sin subir nada).
2. Si coincide, seguí [la guía para agregar juegos](../docs/agregar-fuente-de-juegos.md): explica cómo hashear, verificar contra RetroAchievements y dar de alta en el catálogo.
3. Abrí el PR contra `dev` siguiendo [CONTRIBUTING.md](../CONTRIBUTING.md). Si no querés tocar código, abrí un issue con el hash y el link al item de archive.org.

Solo sirven coincidencias **por hash**: un archivo con el mismo nombre pero otro dump no desbloquea los logros.

## Otros

- `Data/.*_hash_cache.json`: cache temporal de `scripts/sync_source.py` para retomar un resync cortado. Está en `.gitignore`.
- `game_hashes.json` (raíz del repo, no acá): tu lista personal de "Want to Play", generada por `scripts/sync_want_to_play.py`. También en `.gitignore`.
