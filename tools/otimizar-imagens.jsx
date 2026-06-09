// =====================================================================
// Mestiza — Otimizar imagens para web (batch)
// ---------------------------------------------------------------------
// Redimensiona a borda mais longa para 2000px (nunca aumenta),
// converte para 8-bit, achata camadas e salva em JPEG de alta qualidade
// numa subpasta "otimizadas". Não altera os originais.
//
// COMO USAR:
//   Photoshop > File > Scripts > Browse...  e escolha este arquivo.
//   (ou arraste este .jsx para cima da janela do Photoshop)
//   Vai abrir um seletor de pasta — escolha a pasta "imagens".
// =====================================================================

#target photoshop

(function () {
    // ---- ajustes ----
    var MAX_EDGE     = 2000;   // px na borda mais longa
    var JPEG_QUALITY = 9;      // escala do Photoshop 0–12 (9 ≈ alta, ~85)
    // -----------------

    var inputFolder = Folder.selectDialog("Selecione a pasta com as imagens originais");
    if (!inputFolder) { return; }

    var outFolder = new Folder(inputFolder.fsName + "/otimizadas");
    if (!outFolder.exists) { outFolder.create(); }

    var exts = /\.(jpg|jpeg|png|tif|tiff|heic|heif|psd|webp)$/i;
    var files = inputFolder.getFiles(function (f) {
        return (f instanceof File) && exts.test(f.name);
    });

    if (!files.length) {
        alert("Nenhuma imagem encontrada nessa pasta.");
        return;
    }

    var prevDialogs = app.displayDialogs;
    var prevUnits   = app.preferences.rulerUnits;
    app.displayDialogs        = DialogModes.NO;
    app.preferences.rulerUnits = Units.PIXELS;

    var done = 0, failed = [];

    for (var i = 0; i < files.length; i++) {
        var doc = null;
        try {
            doc = app.open(files[i]);

            // achata tudo numa camada (remove transparência/efeitos)
            try { doc.flatten(); } catch (eFlat) {}

            // 8-bit para web
            if (doc.bitsPerChannel !== BitsPerChannelType.EIGHT) {
                doc.bitsPerChannel = BitsPerChannelType.EIGHT;
            }

            // redimensiona a borda longa para MAX_EDGE (só reduz)
            var w = doc.width.as("px");
            var h = doc.height.as("px");
            var scale = MAX_EDGE / Math.max(w, h);
            if (scale < 1) {
                doc.resizeImage(
                    UnitValue(Math.round(w * scale), "px"),
                    UnitValue(Math.round(h * scale), "px"),
                    72, ResampleMethod.BICUBICSHARPER
                );
            }

            // salva JPEG
            var base = files[i].name.replace(/\.[^\.]+$/, "");
            var outFile = new File(outFolder.fsName + "/" + base + ".jpg");

            var opt = new JPEGSaveOptions();
            opt.quality           = JPEG_QUALITY;
            opt.embedColorProfile = true;
            opt.formatOptions     = FormatOptions.STANDARDBASELINE;
            opt.matte             = MatteType.NONE;

            doc.saveAs(outFile, opt, true, Extension.LOWERCASE);
            doc.close(SaveOptions.DONOTSAVECHANGES);
            doc = null;
            done++;
        } catch (e) {
            failed.push(files[i].name);
            if (doc) { try { doc.close(SaveOptions.DONOTSAVECHANGES); } catch (e2) {} }
        }
    }

    app.displayDialogs         = prevDialogs;
    app.preferences.rulerUnits = prevUnits;

    var msg = done + " de " + files.length + " imagens otimizadas.\n\nPasta: " + outFolder.fsName;
    if (failed.length) { msg += "\n\nFalharam (" + failed.length + "): " + failed.join(", "); }
    alert(msg);
})();
