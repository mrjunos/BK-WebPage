"""
Recorta una imagen a las mismas proporciones de una imagen de referencia, centrada.
Siempre exporta en JPG (quality 95).

Requiere: pip install Pillow

Uso:
    python3 scripts/crop_to_match.py <imagen_referencia> <imagen_a_recortar> [-o salida.jpg]

Ejemplo para procesar una imagen de producto:
    python3 scripts/crop_to_match.py \\
        public/images/Products/BK-Coffee-Bags-Product.jpg \\
        "/ruta/a/mi-imagen.png" \\
        -o public/images/Products/nombre-final.jpg
"""

import argparse
from pathlib import Path
from PIL import Image


def crop_to_aspect(img: Image.Image, aspect_w: int, aspect_h: int) -> Image.Image:
    w, h = img.size
    target_ratio = aspect_w / aspect_h

    if w / h > target_ratio:
        # Imagen más ancha que el ratio: recortar ancho
        new_w = int(h * target_ratio)
        new_h = h
    else:
        # Imagen más alta que el ratio: recortar alto
        new_w = w
        new_h = int(w / target_ratio)

    left = (w - new_w) // 2
    top = (h - new_h) // 2
    return img.crop((left, top, left + new_w, top + new_h))


def main():
    parser = argparse.ArgumentParser(description="Recorta una imagen a las proporciones de otra, centrada.")
    parser.add_argument("referencia", help="Imagen de referencia (para obtener proporciones)")
    parser.add_argument("imagen", help="Imagen a recortar")
    parser.add_argument("-o", "--output", help="Ruta de salida (default: <nombre>_cropped.<ext>)")
    args = parser.parse_args()

    ref = Image.open(args.referencia)
    img = Image.open(args.imagen)

    rw, rh = ref.size
    result = crop_to_aspect(img, rw, rh)
    fw, fh = result.size

    if args.output:
        out_path = Path(args.output).with_suffix(".jpg")
    else:
        p = Path(args.imagen)
        out_path = p.with_stem(p.stem + "_cropped").with_suffix(".jpg")

    if result.mode in ("RGBA", "P", "LA"):
        result = result.convert("RGB")

    result.save(str(out_path), "JPEG", quality=95)
    print(f"Ratio referencia: {rw}:{rh} ({rw/rh:.3f})")
    print(f"Guardado: {out_path} ({fw}x{fh})")


if __name__ == "__main__":
    main()
