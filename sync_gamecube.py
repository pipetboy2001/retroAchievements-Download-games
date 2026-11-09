"""
Da de alta Nintendo GameCube en Data/TamperMonkeyRetroachievements.json
cruzando el .dat de RetroAchievements contra el item de archive.org
'RetroAchievementsGameCube', sin descargar ningun juego (matchea por MD5
del .rvz, no por nombre -- ver src/core/gamecube_sync.py).

Uso:
    python sync_gamecube.py
"""

from src.core.gamecube_sync import GameCubeSync

if __name__ == "__main__":
    GameCubeSync().run()
