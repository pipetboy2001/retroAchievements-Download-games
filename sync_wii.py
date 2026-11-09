"""
Da de alta Wii en Data/TamperMonkeyRetroachievements.json cruzando el .dat
de RetroAchievements contra el item de archive.org 'RetroAchievementsWii',
sin descargar ningun juego (matchea por MD5, no por nombre -- ver
src/core/dat_archive_sync.py).

Uso:
    python sync_wii.py
"""

from src.core.wii_sync import WiiSync

if __name__ == "__main__":
    WiiSync().run()
