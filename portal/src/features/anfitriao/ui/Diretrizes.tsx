import { Alerta } from "@/components/ds/Alerta";

/** Texto do aceite de direitos, obrigatório antes de cada envio (§3.4). */
export const ROTULO_ACEITE = "Declaro que tenho direito de usar as imagens e os textos enviados.";

/**
 * Lembrete das diretrizes da casa (§8). O cumprimento é critério da revisão
 * da curadoria, não validação automática.
 */
export function DiretrizesAnfitriao() {
  return (
    <Alerta title="Diretrizes da casa">
      Atribua cada afirmação a uma fonte (“Segundo o Poimandres…”), deixe incertas as datas incertas e evite
      tom dogmático ou de conversão. A curadoria usa estas diretrizes na revisão.
    </Alerta>
  );
}
