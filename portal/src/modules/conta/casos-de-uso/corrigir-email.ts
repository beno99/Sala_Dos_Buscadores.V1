import { randomBytes } from "node:crypto";
import { VALIDADE_VERIFICACAO_H } from "../acesso";
import type { ContaRepositorio, Membro, Resultado } from "../conta.contratos";
import { hash } from "./sessao";

export interface CorrecaoEmail {
  membro: Membro;
  enviado: boolean;
  erroEnvio?: string;
}
/** Troca e emissão são atômicas; falha de transporte preserva o endereço corrigido. */
export async function corrigirEEmitir(
  contas: Pick<ContaRepositorio, "corrigirEmailPendente" | "porId">,
  id: string,
  email: string,
  enviar: (membro: Membro, token: string) => Promise<void>,
  agora = new Date(),
): Promise<Resultado<CorrecaoEmail>> {
  const token = randomBytes(24).toString("base64url");
  const membro = await contas.corrigirEmailPendente(id, email, {
    tokenHash: hash(token),
    expiraEm: new Date(agora.getTime() + VALIDADE_VERIFICACAO_H * 60 * 60_000),
  });
  if (!membro)
    return {
      ok: false,
      campo: "email",
      erro: "aguarde um minuto desde o último envio e confira o endereço. Se já estiver cadastrado, entre na conta correspondente.",
    };
  try {
    await enviar(membro, token);
    const atual = await contas.porId(id);
    if (atual && atual.email !== membro.email)
      return {
        ok: true,
        valor: {
          membro: atual,
          enviado: false,
          erroEnvio:
            "o endereço foi alterado em outra sessão. Confira o endereço atual e use Reenviar e-mail se necessário.",
        },
      };
    return { ok: true, valor: { membro: atual ?? membro, enviado: true } };
  } catch {
    const atual = await contas.porId(id);
    return {
      ok: true,
      valor: {
        membro: atual ?? membro,
        enviado: false,
        erroEnvio:
          "o endereço foi corrigido, mas não foi possível registrar o envio. Aguarde um minuto e use Reenviar e-mail.",
      },
    };
  }
}
