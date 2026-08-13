/**
 * Arma multipart para crear/actualizar producto.
 * Las imágenes nuevas van en `files`; las ya guardadas en imagenesMeta (JSON).
 */
export function buildRetailProductFormData(productFields, imagenes = []) {
  const fd = new FormData();
  const newFiles = [];
  const imagenesMeta = imagenes.map((img) => {
    if (img.file) {
      newFiles.push(img.file);
      return { principal: Boolean(img.principal) };
    }
    return {
      principal: Boolean(img.principal),
      existingUrl: img.url,
    };
  });

  fd.append('teamId', productFields.teamId);
  fd.append('teamType', productFields.teamType);
  fd.append('nombre', productFields.nombre);
  fd.append('categoria', productFields.categoria);
  if (productFields.descripcion) {
    fd.append('descripcion', productFields.descripcion);
  }
  if (productFields.marca) {
    fd.append('marca', productFields.marca);
  }
  fd.append('variantes', JSON.stringify(productFields.variantes));
  if (productFields.tags?.length) {
    fd.append('tags', JSON.stringify(productFields.tags));
  }
  if (imagenesMeta.length) {
    fd.append('imagenesMeta', JSON.stringify(imagenesMeta));
  }
  newFiles.forEach((file) => fd.append('files', file));
  return fd;
}

export function retailProductPayloadHasNewImages(imagenes = []) {
  return imagenes.some((img) => img.file);
}
