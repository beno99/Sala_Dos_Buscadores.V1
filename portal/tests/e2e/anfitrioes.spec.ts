import { readFileSync } from "node:fs";
import { type Browser, expect, type Page, test } from "@playwright/test";
import { entrar, entrarComoAdmin, restaurarAcervo } from "./apoio";

/*
 * Anfitriões (§13): convite → cadastro → Sala com 2 artigos → revisão →
 * público → correção → comparação → edição que tira do ar → e-mails; e a
 * candidatura com recusa, reenvio e aprovação, seguida do rebaixamento.
 * O acervo em memória é compartilhado: os fluxos começam restaurando a demonstração.
 * Fluxos longos: rodam só no desktop (o celular é coberto pelas jornadas do portal).
 */

const MOTIVO = "Falta indicar a edição usada na citação do segundo parágrafo.";

test.skip(({ isMobile }) => isMobile, "Fluxo longo; roda no desktop.");

async function novaPagina(browser: Browser, baseURL: string | undefined): Promise<Page> {
  const ctx = await browser.newContext({ baseURL });
  return ctx.newPage();
}

async function dispensarOnboarding(page: Page) {
  const dialogo = page.getByRole("dialog", { name: "Boas-vindas à Sala dos Buscadores" });
  await expect(dialogo).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialogo).toHaveCount(0);
}

async function enviarComAceite(page: Page) {
  const sheet = page.getByRole("dialog", { name: "Enviar para revisão" });
  await expect(sheet).toBeVisible();
  await sheet.getByRole("checkbox", { name: /Declaro que tenho direito/ }).check();
  await sheet.getByRole("button", { name: "Enviar", exact: true }).click();
}

async function reprovarComMotivo(page: Page, titulo: string) {
  const sheet = page.getByRole("dialog", { name: titulo });
  await sheet.getByRole("textbox", { name: "Motivo" }).fill(MOTIVO);
  await sheet.getByRole("button", { name: /^(Reprovar|Recusar)$/ }).click();
}

test("convite, Sala com dois artigos, revisão, comparação e edição que tira do ar", async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(180_000);
  const marca = Date.now().toString(36);
  const email = `ana.${marca}@exemplo.com`;
  const nomeSala = `Leituras de Plotino ${marca}`;

  // 1. O admin convida.
  await entrarComoAdmin(page);
  await restaurarAcervo(page);
  await page.goto("/admin/usuarios?aba=convites");
  await page.getByRole("textbox", { name: "E-mail" }).fill(email);
  await page.getByRole("button", { name: "Convidar", exact: true }).click();
  await expect(page.getByText(`Convite enviado para ${email}. Vale 7 dias.`)).toBeVisible();
  await page.goto("/admin/caixa-saida");
  await page
    .getByRole("button", { name: /Convite para ser anfitrião/ })
    .first()
    .click();
  const link = /\/cadastro\?convite=[\w-]+/.exec(await page.locator("main").innerText())?.[0];
  expect(link).toBeTruthy();

  // 2. A pessoa se cadastra pelo link e completa o perfil.
  const anf = await novaPagina(browser, baseURL);
  await anf.goto(link as string);
  await expect(anf.getByRole("textbox", { name: "E-mail" })).toHaveValue(email);
  await anf.getByRole("textbox", { name: "Pseudônimo" }).fill("Ana Lins");
  await anf.getByLabel("Senha", { exact: true }).fill("procissao-do-uno");
  await anf.getByRole("checkbox", { name: /Concordo com o uso/ }).check();
  await anf.getByRole("button", { name: "Criar conta de anfitrião" }).click();
  await expect(anf).toHaveURL(/\/anfitriao\/perfil/);
  await dispensarOnboarding(anf);
  await anf.getByRole("textbox", { name: "Nome público" }).fill(`Ana Lins (teste ${marca})`);
  await anf.getByRole("button", { name: "Gerar do nome" }).click();
  await anf.getByRole("textbox", { name: "Credencial" }).fill("Leitora de Plotino");
  await anf
    .getByRole("textbox", { name: "Apresentação" })
    .fill("Perfil de teste. Leio as Enéadas em tradução.");
  await anf.getByRole("button", { name: "Salvar perfil" }).click();
  await expect(anf.getByText("Perfil salvo. Ele já aparece na sua página pública.")).toBeVisible();

  // 3. Cria uma Sala com dois artigos (um com vídeo, outro com site e fonte nova) e envia.
  await anf.goto("/anfitriao/salas/nova");
  await anf.getByRole("textbox", { name: "Nome", exact: true }).fill(nomeSala);
  await anf
    .getByRole("textbox", { name: "Descrição", exact: true })
    .fill("As Enéadas lidas tratado a tratado.");
  await expect(anf).toHaveURL(/\/anfitriao\/salas\/s-/);
  const urlSala = anf.url();

  await anf.getByRole("link", { name: "Novo artigo" }).click();
  await anf.getByRole("textbox", { name: "Título", exact: true }).fill("A procissão do Uno");
  await anf
    .locator("#campo-corpo textarea")
    .first()
    .fill("Segundo Plotino, nas _Enéadas_, tudo procede do Uno sem que ele diminua.");
  await anf.getByRole("button", { name: "Origem do universo", exact: true }).click();
  await anf.getByRole("button", { name: /^Hermetica/ }).click();
  await anf.getByRole("textbox", { name: /^Link/ }).fill("https://youtu.be/abcdefghijk");
  await expect(anf).toHaveURL(/\/anfitriao\/artigos\/c-/);
  await expect(anf.getByText(/Salvo às/)).toBeVisible();

  await anf.goto(urlSala);
  await anf.getByRole("link", { name: "Novo artigo" }).click();
  await anf.getByRole("textbox", { name: "Título", exact: true }).fill("O retorno da alma");
  await anf
    .locator("#campo-corpo textarea")
    .first()
    .fill("Segundo Plotino, a alma volta ao Uno pela contemplação.");
  await anf.getByRole("button", { name: "Alma", exact: true }).click();
  await anf.getByRole("button", { name: "Nova fonte" }).click();
  const gaveta = anf.getByRole("dialog", { name: "Nova fonte" });
  await gaveta.getByRole("textbox", { name: "Título da obra" }).fill("Enéadas");
  await gaveta.getByRole("textbox", { name: "Autor, editor ou tradutor" }).fill("Plotino (autor)");
  await gaveta.getByRole("combobox", { name: "Tipo" }).selectOption("Fonte primária");
  await gaveta.getByRole("textbox", { name: "Localização" }).fill("Edição de Porfírio, séc. III");
  await gaveta.getByRole("button", { name: "Cadastrar e escolher" }).click();
  await expect(anf.getByText(/Fonte cadastrada e escolhida/)).toBeVisible();
  await anf.getByRole("textbox", { name: /^Link/ }).fill("https://www.exemplo.org/plotino");
  await expect(anf).toHaveURL(/\/anfitriao\/artigos\/c-/);
  await expect(anf.getByText(/Salvo às/)).toBeVisible();

  await anf.goto(urlSala);
  await anf.getByRole("button", { name: "Enviar para revisão" }).click();
  await enviarComAceite(anf);
  await expect(anf.getByText("Sala enviada para revisão com 2 artigos.")).toBeVisible();

  // 4. O admin reprova um artigo com motivo e aprova a Sala.
  await page.goto("/admin/anfitrioes");
  await page.getByRole("link", { name: `Ana Lins (teste ${marca})` }).click();
  await page.getByRole("link", { name: nomeSala }).click();
  await page
    .getByRole("article", { name: "O retorno da alma" })
    .getByRole("button", { name: "Reprovar este artigo" })
    .click();
  await reprovarComMotivo(page, "Reprovar o artigo");
  await expect(page.getByText("Artigo devolvido ao anfitrião com o motivo.")).toBeVisible();
  await page.getByRole("button", { name: "Aprovar Sala" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Aprovar e publicar" }).click();
  await expect(page.getByText("Sala publicada com 1 artigo.")).toBeVisible();

  // 5. O público vê a Sala com 1 artigo e o selo, fora da grade comparativa.
  await page.goto("/salas");
  const secao = page.getByRole("region", { name: "Salas de anfitriões" });
  await expect(secao.getByRole("heading", { name: nomeSala })).toBeVisible();
  await secao
    .getByRole("article", { name: nomeSala })
    .getByRole("link", { name: /Entrar na sala/ })
    .click();
  await page.waitForURL(/\/salas\/[^/]+$/);
  const urlPublica = page.url();
  const slugSala = new URL(urlPublica).pathname.split("/")[2];
  expect(slugSala).toBeTruthy();
  await expect(page.getByRole("link", { name: "A procissão do Uno" })).toBeVisible();
  await expect(page.getByRole("link", { name: "O retorno da alma" })).toHaveCount(0);
  await expect(page.getByText("Revisado pela curadoria").first()).toBeVisible();
  await page.goto("/comparar?tema=origem-do-universo");
  await expect(page.locator(`[data-sala="${slugSala}"]`)).toHaveCount(0);

  // 6. O anfitrião vê o motivo, corrige e reenvia; o admin aprova.
  await anf.goto("/anfitriao");
  await anf.getByRole("link", { name: "O artigo “O retorno da alma” voltou para ajustes." }).click();
  await expect(anf.getByText(MOTIVO)).toBeVisible();
  await anf
    .locator("#campo-corpo textarea")
    .first()
    .fill("Segundo Plotino, na _Enéada_ VI, 9, a alma volta ao Uno pela contemplação.");
  await expect(anf.getByText(/Salvo às/)).toBeVisible();
  await anf.getByRole("button", { name: "Enviar para revisão" }).click();
  await enviarComAceite(anf);
  await expect(anf.getByText("Artigo enviado para revisão.")).toBeVisible();

  await page.goto("/admin/anfitrioes");
  await page.getByRole("link", { name: `Ana Lins (teste ${marca})` }).click();
  await page.getByRole("link", { name: nomeSala }).click();
  await page
    .getByRole("article", { name: "O retorno da alma" })
    .getByRole("button", { name: "Aprovar este artigo" })
    .click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Aprovar e publicar" }).click();
  await expect(page.getByText("Artigo publicado.")).toBeVisible();

  // 7. O admin liga "Incluir na comparação" e a Sala aparece na grade.
  await page.getByText("Incluir na comparação e no assistente").click();
  await expect(page.getByText("A Sala entra na grade comparativa e no acervo do assistente.")).toBeVisible();
  await page.goto("/comparar?tema=origem-do-universo");
  await expect(page.locator(`[data-sala="${slugSala}"]`)).toHaveCount(1);

  // 8. O anfitrião edita um artigo publicado e ele some do portal.
  await page.goto(urlPublica);
  await page.getByRole("link", { name: "A procissão do Uno" }).click();
  await page.waitForURL(/\/salas\/[^/]+\/[^/]+$/);
  const urlArtigo = page.url();
  await anf.goto(urlSala);
  await anf.getByRole("link", { name: "A procissão do Uno" }).click();
  await anf.getByRole("textbox", { name: "Título", exact: true }).fill("A procissão do Uno, segundo Plotino");
  await anf.getByRole("button", { name: "Salvar alterações" }).click();
  await anf.getByRole("alertdialog").getByRole("button", { name: "Salvar e tirar do ar" }).click();
  await expect(anf.getByText(/O artigo saiu do ar/)).toBeVisible();
  await page.goto(urlArtigo);
  await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();

  // 9. A caixa de saída tem os e-mails esperados.
  await page.goto("/admin/caixa-saida");
  for (const assunto of [
    "Convite para ser anfitrião na Sala dos Buscadores",
    `Sua Sala “${nomeSala}” foi publicada`,
    "Seu artigo “O retorno da alma” voltou para ajustes",
    "Seu artigo “O retorno da alma” foi publicado",
  ]) {
    await expect(
      page.getByRole("button", { name: new RegExp(assunto.replace(/[?()]/g, "\\$&")) }).first(),
    ).toBeVisible();
  }
});

test("candidatura recusada e reenviada, aprovação e rebaixamento com “Despublicar tudo”", async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(120_000);
  const marca = Date.now().toString(36);

  await entrarComoAdmin(page);
  await restaurarAcervo(page);

  // Um membro novo se candidata.
  const membro = await novaPagina(browser, baseURL);
  await membro.goto("/cadastro");
  await membro.getByRole("textbox", { name: "Pseudônimo", exact: true }).fill("Leitor de Efrém");
  await membro.getByRole("textbox", { name: "E-mail", exact: true }).fill(`efrem.${marca}@exemplo.com`);
  await membro.getByLabel("Senha", { exact: true }).fill("hinos-de-nisibis");
  await membro.getByRole("checkbox", { name: /Concordo com o uso/ }).check();
  await membro.getByRole("button", { name: "Criar conta" }).click();
  await dispensarOnboarding(membro);
  const candidatar = async () => {
    await membro.goto("/ajustes");
    await membro.getByRole("button", { name: "Quero ser anfitrião" }).click();
    await membro.getByRole("textbox", { name: "Nome público" }).fill(`Leitor de Efrém ${marca}`);
    await membro.getByRole("textbox", { name: "Credencial" }).fill("Estudante de poesia siríaca");
    await membro
      .getByRole("textbox", { name: "Apresentação" })
      .fill("Leio os hinos de Efrém de Nísibis em tradução.");
    await membro.getByRole("button", { name: "Enviar candidatura" }).click();
    await expect(membro.getByText("Sua candidatura está em análise")).toBeVisible();
  };
  await candidatar();

  // O admin recusa com motivo.
  await page.goto("/admin/usuarios?aba=candidaturas");
  await page
    .getByRole("row", { name: new RegExp(`Leitor de Efrém ${marca}`) })
    .getByRole("button", { name: "Recusar" })
    .click();
  await reprovarComMotivo(page, "Recusar a candidatura");
  await expect(page.getByText(/Candidatura recusada/)).toBeVisible();

  // O membro vê o motivo e se candidata de novo; o admin aprova.
  await membro.goto("/ajustes");
  await expect(membro.getByText(MOTIVO)).toBeVisible();
  await candidatar();
  await page.goto("/admin/usuarios?aba=candidaturas");
  await page
    .getByRole("row", { name: new RegExp(`Leitor de Efrém ${marca}.*Pendente`) })
    .getByRole("button", { name: "Aprovar" })
    .click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Aprovar", exact: true }).click();
  await expect(page.getByText(/agora é anfitrião/)).toBeVisible();
  await membro.goto("/anfitriao");
  await expect(membro.getByRole("heading", { level: 1, name: "Minhas Salas" })).toBeVisible();

  // Rebaixamento da anfitriã de demonstração com "Despublicar tudo".
  await page.goto("/admin/usuarios");
  await page
    .getByRole("row", { name: /Helena Varga/ })
    .getByRole("button", { name: "Tirar o papel" })
    .click();
  const sheet = page.getByRole("dialog", { name: "Tirar o papel de anfitrião" });
  await sheet.getByRole("radio", { name: /Despublicar tudo/ }).check();
  await sheet.getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByText("Papel retirado. Todo o conteúdo foi arquivado.")).toBeVisible();
  await page.goto("/salas");
  await expect(page.getByRole("region", { name: "Salas de anfitriões" })).toHaveCount(0);

  // A ex-anfitriã vira membro e não acessa mais /anfitriao.
  const helena = await novaPagina(browser, baseURL);
  const fonte = readFileSync("src/features/auth/contas.ts", "utf8");
  const bloco = fonte.slice(fonte.indexOf("CONTA_ANFITRIAO_DEMONSTRACAO = {"));
  const senha = /senha: "([^"]+)"/.exec(bloco)?.[1] ?? "";
  await entrar(helena, "helena.varga@exemplo.com", senha, "/anfitriao");
  await expect(helena.getByRole("heading", { name: "Acesso restrito" })).toBeVisible();

  // Volta o acervo para os próximos testes.
  await restaurarAcervo(page);
});
