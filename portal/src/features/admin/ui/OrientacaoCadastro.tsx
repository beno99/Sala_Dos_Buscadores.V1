import type { ItemChecklistVisual } from "@/components/ds/Curadoria";

/** Explicação do fluxo que reutiliza os itens reais de validação, sem outra matriz de obrigatoriedade. */
export function OrientacaoCadastro({
  itens,
  salvar,
  publicar,
}: {
  itens: ItemChecklistVisual[];
  salvar: string;
  publicar: string;
}) {
  return (
    <details className="sdb-material sdb-panel">
      <summary className="sdb-headline">O que este cadastro precisa ter?</summary>
      <p className="sdb-body-sm">{salvar}</p>
      <p className="sdb-body-sm">{publicar}</p>
      <ul className="sdb-body-sm">
        {itens
          .filter((i) => i.estado !== "alerta")
          .map((i) => (
            <li key={i.id}>
              {i.rotulo}. {i.ajuda}
            </li>
          ))}
      </ul>
      <p className="sdb-help">
        Os itens do painel levam diretamente ao campo que precisa de atenção. Recomendações de revisão não
        bloqueiam a publicação.
      </p>
    </details>
  );
}
