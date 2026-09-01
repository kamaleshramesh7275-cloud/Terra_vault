"""
Terra_vault — Colab Training Dataset Exporter
Exports local reviewer corrections & annotated land records into a zip file ready for Google Colab training.
"""
from pathlib import Path
import json
import zipfile
import shutil


def export_for_colab(data_dir: str = "/app/data", output_zip: str = "/tmp/terravault_colab_dataset.zip") -> str:
    base = Path(data_dir)
    self_learning_file = base / "self_learning" / "self_learning_samples.jsonl"

    export_dir = Path("/tmp/colab_export")
    if export_dir.exists():
        shutil.rmtree(export_dir)
    export_dir.mkdir(parents=True, exist_ok=True)

    # Copy self-learning dataset file
    if self_learning_file.exists():
        shutil.copy(self_learning_file, export_dir / "dataset.jsonl")

    # Create zip file
    with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in export_dir.rglob("*"):
            if f.is_file():
                zf.write(f, f.relative_to(export_dir))

    return output_zip


if __name__ == "__main__":
    out = export_for_colab(data_dir="data", output_zip="terravault_colab_dataset.zip")
    print(f"✅ Exported Google Colab dataset to: {out}")
