import type { Metadata } from "next";
import { Accordion, AccordionItem } from "@/components/ds/Accordion";
import { Alerta } from "@/components/ds/Alerta";
import { formatarData } from "@/lib/texto";
import { listarEmails } from "@/server/caixa-saida";

export const metadata: Metadata = { title: "Caixa de saída" };

const hora = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/** Caixa de saída simulada (§10): os e-mails que o portal "enviou", do mais recente ao mais antigo. */
export default function CaixaSaida() {
  const emails = listarEmails();
  return (
    <>
      <header className="flex flex-col gap-3">
        <p className="sdb-meta sdb-secondary">Curadoria</p>
        <h1 className="sdb-title-1">Caixa de saída</h1>
        <p className="sdb-body-sm sdb-secondary max-w-read">
          Nenhum e-mail sai do servidor nesta etapa: cada envio fica registrado aqui. A caixa sobrevive a
          “Restaurar acervo” e some quando o servidor reinicia.
        </p>
      </header>
      {emails.length === 0 ? (
        <Alerta title="Nenhum e-mail enviado desde que o servidor iniciou." />
      ) : (
        <Accordion className="sdb-material max-w-read">
          {emails.map((e) => (
            <AccordionItem
              key={e.id}
              title={
                <span className="flex flex-col gap-1">
                  <span>{e.assunto}</span>
                  <span className="sdb-footnote">
                    Para {e.para} · {formatarData(e.quando.slice(0, 10))}, {hora(e.quando)}
                  </span>
                </span>
              }
            >
              <p className="sdb-body-sm m-0 whitespace-pre-line">{e.corpo}</p>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </>
  );
}
