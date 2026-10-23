# Iconografia

Ícones do [Phosphor](https://phosphoricons.com) (licença MIT), embutidos no runtime: nada vem da rede.

- `<span data-icon="busca"></span>` + `SalaBuscadores.hydrate()`, ou `SalaBuscadores.icon("busca")`. No portal, `<Icon name="busca" />`. Herdam `currentColor`.
- Peso **Regular** em toda a interface. O **Fill** aparece sozinho quando o controle está ativo (`aria-current="page"`, `aria-selected="true"`, `aria-pressed="true"`) ou com a classe `sdb-icon--fill`. Cada ícone leva os dois desenhos (`.sdb-icon__r` e `.sdb-icon__f`) e o CSS escolhe.
- 16 px em texto, 20 px padrão, 24 px isolado. Dentro de discos (`.sdb-alert__icon`, `.sdb-toast__icon`, `.sdb-palette__lead`) use 17–18 px. Em 12–14 px, `sdb-icon--forte` engrossa o desenho até perto do peso Bold.
- Ícones de proveniência reservados: `fontePrimaria` (scroll), `curado` (seal-check), `especialista` (pen-nib), `comunidade` (users-three), `ia` (sparkle).
- Sem emoji. Sem símbolos de tradição como ícone de interface: a marca de uma Sala é o arco.

## Trocar ou acrescentar um ícone

1. Escolha o ícone em phosphoricons.com e ponha o nome dele em `phosphor.json` (`"nome": "icone-phosphor"`; use `"icone:fill"` para forçar o preenchido, como em `play` e `parar`).
2. Baixe o pacote e gere: `npm pack @phosphor-icons/core@2.1.1 && tar xzf phosphor-icons-core-2.1.1.tgz`, depois `node design-system/scripts/icones-phosphor.mjs package`.
3. Rode `node design-system/scripts/build.mjs` e, no portal, `npm run ds:sync`.
