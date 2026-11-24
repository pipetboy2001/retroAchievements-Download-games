"""
Tests sobre /search (api/index.py): la búsqueda por hash devuelve también la
carátula y los logros del juego, cruzando el hash -> game_id del dataset con
Data/retroachievements_metadata.json. Usa el dataset real y mockea solo las
dos verificaciones que salen a la red (archive.org y RA).
"""

from unittest.mock import patch

import api.index as api_module

# 007 - Agent Under Fire (PS2), game_id 20816 en el dataset.
_HASH = "4C1DF2B611348BC16ACE85C4CBC626DB"


def _search(term):
    with (
        patch.object(api_module, "is_download_url_reachable", return_value=True),
        patch.object(api_module, "is_hash_recognized_by_ra", return_value=True),
    ):
        return api_module.app.test_client().post("/search", data={"search_term": term})


def test_search_returns_icon_and_achievements_from_metadata():
    body = _search(_HASH.lower()).get_json()
    assert body["success"] is True
    assert body["console"] == "PS2"
    assert body["image_icon"].startswith("https://media.retroachievements.org/")
    assert body["achievements"] == 66


def test_search_without_metadata_for_game_returns_nulls():
    with patch.object(api_module, "load_ra_metadata", return_value={}):
        body = _search(_HASH).get_json()
    assert body["success"] is True
    assert body["image_icon"] is None
    assert body["achievements"] is None


def test_search_unknown_hash_returns_404():
    resp = _search("0" * 32)
    assert resp.status_code == 404
    assert resp.get_json()["success"] is False
