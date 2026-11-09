"""
RetroAchievements Downloader - Aplicación unificada.
Permite elegir entre modo hash directo o lista de deseos.
"""

from rich.console import Console
from rich.prompt import Prompt

from src.app import AppMode, RetroAchievementsDownloader


def main():
    """Función principal que permite elegir el modo de operación."""
    console = Console()

    console.print("[bold green]🎮 RetroAchievements Downloader[/bold green]")
    console.print("\nSeleccione el modo de operación:", style="bold blue")
    console.print("1. Búsqueda directa por hash", style="bold cyan")
    console.print("2. Lista de deseos (Want to Play)", style="bold cyan")

    choice = Prompt.ask("Ingrese el número del modo que desea usar", choices=["1", "2"], default="1")

    if choice == "1":
        app = RetroAchievementsDownloader(AppMode.DIRECT_HASH)
    else:
        app = RetroAchievementsDownloader(AppMode.WANT_TO_PLAY)

    app.run()


if __name__ == "__main__":
    main()
