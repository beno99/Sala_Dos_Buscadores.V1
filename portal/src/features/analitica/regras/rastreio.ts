const PREFIXOS_PUBLICOS = [
  "/salas",
  "/artigos",
  "/videos",
  "/biblioteca",
  "/comparar",
  "/destaques",
  "/trilhas",
  "/sobre",
  "/anfitrioes",
];

export function deveMedirCaminho(caminho: string): boolean {
  if (caminho === "/") return true;
  return PREFIXOS_PUBLICOS.some((p) => caminho === p || caminho.startsWith(`${p}/`));
}
