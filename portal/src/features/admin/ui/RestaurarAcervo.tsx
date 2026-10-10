"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ds/Button";
import { ModalConfirmacao } from "@/components/ds/Modal";
import { useToast } from "@/components/ds/Toast";
import { restaurarAcervoAcao } from "@/server/admin/acoes";

/** Volta artigos, vídeos e fontes aos dados de demonstração (o histórico é mantido). */
export function RestaurarAcervo() {
  const router = useRouter();
  const toast = useToast();
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const confirmar = async () => {
    setCarregando(true);
    const r = await restaurarAcervoAcao();
    setCarregando(false);
    setAberto(false);
    if (r.ok) {
      toast(r.mensagem, { icon: "regenerar" });
      router.refresh();
    } else toast(r.mensagem, { variant: "erro", title: "Erro: o acervo não foi restaurado" });
  };

  return (
    <>
      <Button variant="secondary" size="sm" icon="regenerar" onClick={() => setAberto(true)}>
        Restaurar acervo de demonstração
      </Button>
      <ModalConfirmacao
        open={aberto}
        titulo="Restaurar o acervo de demonstração?"
        icone="regenerar"
        destrutivo
        rotuloConfirmar="Restaurar"
        carregando={carregando}
        onCancelar={() => setAberto(false)}
        onConfirmar={confirmar}
      >
        Artigos, vídeos e fontes voltam ao estado inicial. O que foi criado ou editado nesta sessão sai do
        portal e da curadoria, e a conta de demonstração de membro volta ao progresso inicial. O histórico de
        auditoria é mantido.
      </ModalConfirmacao>
    </>
  );
}
