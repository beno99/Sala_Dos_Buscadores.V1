"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Avatar } from "@/components/ds/Avatar";
import { Button } from "@/components/ds/Button";
import { CampoImagem, type ImagemEnviada } from "@/components/ds/CampoImagem";
import { AreaTexto } from "@/components/ds/CamposExtras";
import { Sheet } from "@/components/ds/Sheet";
import { useToast } from "@/components/ds/Toast";
import { iniciais } from "@/lib/texto";
import { salvarPerfilAcao } from "./acoes";
import { LIMITE_SOBRE } from "./regras";

/**
 * "Editar perfil": foto, capa e "Sobre a sua busca", num modal em sheet.
 * As imagens sobem pelo Campo de imagem (/midia) e só valem ao salvar.
 */
export function EditarPerfil({
  foto,
  capa,
  sobre,
  nome,
}: {
  foto: ImagemEnviada | null;
  capa: ImagemEnviada | null;
  sobre: string;
  /** Nome exibido na prévia do cabeçalho. */
  nome: string;
}) {
  const id = useId();
  const router = useRouter();
  const toast = useToast();
  const [aberto, setAberto] = useState(false);
  const [novaFoto, setNovaFoto] = useState(foto);
  const [novaCapa, setNovaCapa] = useState(capa);
  const [texto, setTexto] = useState(sobre);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const abrir = () => {
    setNovaFoto(foto);
    setNovaCapa(capa);
    setTexto(sobre);
    setErro(null);
    setAberto(true);
  };
  const salvar = async () => {
    setSalvando(true);
    const r = await salvarPerfilAcao({
      fotoId: novaFoto?.id ?? null,
      capaId: novaCapa?.id ?? null,
      sobre: texto,
    });
    setSalvando(false);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    setAberto(false);
    toast("Perfil salvo.");
    router.refresh();
  };

  return (
    <>
      <Button variant="primary" size="sm" onClick={abrir}>
        Editar perfil
      </Button>
      <Sheet aberto={aberto} onFechar={() => setAberto(false)} rotuloId={`${id}-titulo`}>
        <div className="flex flex-col gap-5 p-7">
          <h2 id={`${id}-titulo`} className="sdb-title-2 m-0">
            Editar perfil
          </h2>
          <section aria-label="Prévia do seu perfil" className="flex flex-col gap-2">
            <p className="sdb-caption sdb-secondary m-0">PRÉVIA</p>
            <div className={novaCapa ? "sdb-profilehead" : "sdb-profilehead sdb-profilehead--sem-capa"}>
              {novaCapa && (
                <div className="sdb-profilehead__cover">
                  {/* biome-ignore lint/performance/noImgElement: prévia da capa enviada, servida por /midia. */}
                  <img src={novaCapa.url} alt="" />
                </div>
              )}
              <div className="sdb-profilehead__row">
                <span className="sdb-profilehead__photo">
                  <Avatar iniciais={iniciais(nome)} foto={novaFoto?.url} />
                </span>
                <div className="sdb-profilehead__info">
                  <p className="sdb-profilehead__name">{nome}</p>
                  <p className="sdb-profilehead__sub">
                    {novaCapa ? "Com capa." : "Sem capa: o perfil começa direto pela foto."}{" "}
                    {novaFoto ? "Foto recortada em círculo." : "Sem foto: ficam as iniciais."}
                  </p>
                </div>
              </div>
            </div>
          </section>
          <CampoImagem
            label="Foto"
            opcional
            finalidade="avatar"
            help="Uma foto sua; sem ela, ficam as iniciais. Ela é recortada em quadrado no centro e compactada ao enviar."
            valor={novaFoto}
            onMudar={setNovaFoto}
          />
          <CampoImagem
            label="Capa"
            opcional
            finalidade="capa-perfil"
            help="Opcional. Sem capa, o perfil fica sem imagem no topo."
            valor={novaCapa}
            onMudar={setNovaCapa}
          />
          <AreaTexto
            label="Sobre a sua busca"
            help="O que você procura no acervo. Só você vê."
            maxLength={LIMITE_SOBRE}
            contador
            rows={4}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            error={erro ?? undefined}
          />
          <div className="sdb-modal__actions">
            <Button variant="secondary" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button variant="primary" loading={salvando} onClick={salvar}>
              Salvar
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
