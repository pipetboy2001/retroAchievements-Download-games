"""
Tests sobre POST /api/want_to_play (api/index.py) -- cruza la lista "Want
to Play" de RetroAchievements del usuario contra el catálogo local por ID
de juego. Mockea RetroAchievementsClient.get_want_to_play_list para no
pegarle a la API real de RA.
"""

from unittest.mock import patch

import api.index as api_module

_FAKE_CATALOG = [
    {
        "id": "1",
        "name": "Sonic the Hedgehog",
        "consoles": ["Genesis/Mega Drive"],
        "versions": 2,
        "sample_rom_path": "Genesis/Mega Drive/Sonic the Hedgehog.zip",
        "image_icon": None,
        "achievements": 35,
    },
    {
        "id": "2",
        "name": "Other Game",
        "consoles": ["NES"],
        "versions": 1,
        "sample_rom_path": "NES-Famicom/Other Game.zip",
        "image_icon": None,
        "achievements": None,
    },
]


def _client():
    return api_module.app.test_client()


def test_missing_params_returns_400():
    resp = _client().post("/api/want_to_play", data={})
    assert resp.status_code == 400
    assert resp.get_json()["success"] is False


def test_ra_api_error_returns_502():
    with patch.object(
        api_module.RetroAchievementsClient,
        "get_want_to_play_list",
        side_effect=api_module.RetroAchievementsAPIError("boom"),
    ):
        resp = _client().post("/api/want_to_play", data={"api_key": "x", "username": "y"})

    assert resp.status_code == 502
    data = resp.get_json()
    assert data["success"] is False
    assert "boom" in data["message"]


def test_intersects_wtp_ids_against_local_catalog():
    """Unidad aislada: mockea tanto la API de RA como build_games_index(),
    así no depende del contenido real de Data/*.json."""
    fake_wtp = [
        {"ID": 1, "Title": "Sonic the Hedgehog"},  # existe en _FAKE_CATALOG
        {"ID": 999999999, "Title": "No existe"},  # no está en _FAKE_CATALOG
    ]
    with (
        patch.object(api_module.RetroAchievementsClient, "get_want_to_play_list", return_value=fake_wtp),
        patch.object(api_module, "build_games_index", return_value=_FAKE_CATALOG),
    ):
        resp = _client().post("/api/want_to_play", data={"api_key": "x", "username": "y"})

    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True
    assert data["requested"] == 2
    assert data["total"] == 1
    assert data["items"] == [_FAKE_CATALOG[0]]


def test_intersects_against_real_catalog_smoke():
    """Smoke test sin mockear build_games_index(): prueba contra el dataset
    real que el game_id "1" de Data/TamperMonkeyRetroachievements.json es
    efectivamente el juego #1 de RA (Sonic the Hedgehog) -- la asunción
    central de la que depende todo el endpoint."""
    fake_wtp = [{"ID": 1, "Title": "Sonic the Hedgehog"}]
    with patch.object(api_module.RetroAchievementsClient, "get_want_to_play_list", return_value=fake_wtp):
        resp = _client().post("/api/want_to_play", data={"api_key": "x", "username": "y"})

    data = resp.get_json()
    assert data["total"] == 1
    assert data["items"][0]["id"] == "1"
    assert data["items"][0]["name"] == "Sonic the Hedgehog"


def test_empty_want_to_play_list_returns_empty_items():
    with patch.object(api_module.RetroAchievementsClient, "get_want_to_play_list", return_value=[]):
        resp = _client().post("/api/want_to_play", data={"api_key": "x", "username": "y"})

    assert resp.get_json() == {"success": True, "items": [], "total": 0, "requested": 0}


def test_never_echoes_api_key_back():
    with patch.object(api_module.RetroAchievementsClient, "get_want_to_play_list", return_value=[]):
        resp = _client().post("/api/want_to_play", data={"api_key": "super-secret-key", "username": "y"})

    assert "super-secret-key" not in resp.get_data(as_text=True)
