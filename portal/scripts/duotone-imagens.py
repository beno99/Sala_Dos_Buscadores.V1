"""Aplica o duotone da marca (grafite #111313 -> bege #F6E7CE) a uma imagem.

Uso: python3 scripts/duotone-imagens.py <entrada> <saida.webp>

Passos: escala de cinza, autocontraste com corte de 1% nas pontas e
mapeamento linear das luzes para o par grafite-bege. Mantém o tamanho original.
"""
import sys

from PIL import Image, ImageOps

GRAFITE = (0x11, 0x13, 0x13)
BEGE = (0xF6, 0xE7, 0xCE)


def duotone(entrada: str, saida: str) -> None:
    cinza = ImageOps.autocontrast(ImageOps.grayscale(Image.open(entrada).convert("RGB")), cutoff=1)
    cor = ImageOps.colorize(cinza, black=GRAFITE, white=BEGE)
    cor.save(saida, "WEBP", quality=86, method=6)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    duotone(sys.argv[1], sys.argv[2])
