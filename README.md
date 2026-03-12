# CheckInn - Web App para Hotelarias

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

Fala! Agradeço por estar avaliando esse projeto, logo abaixo você irá encontrar instruções sobre como rodar o projeto (que foi pensado e containerizado para fácilitar sua avaliação). O projeto é dividido em dois Módulos:

- **Back-end:** `API REST` desenvolvida com **`Nest.js`**
- **Front-end(SPA):** **`React.js`** usando **`Vite`**.

Também trabalhei com **Docker** e **CI** com **Github Actions**
- **Infra:** **`Docker`** tudo containerizado e pronto com ajustes para evitar conflitos entre portas.
- **CI:** Verificação de testes unitários com **Jest** do backend integrados com GitHub Actions.

Pode ver a lista de tecnologias [AQUI](#🧰-tecnologias-e-ferramentas)

## 🧑‍💻 Respostas para perguntas finais

## 1. Investigação de Bug:

Dada a minha experiência profissional (estágio e freelance), para uma solução rápida e consistente inicialmente eu iria separar em camadas e análisar cada uma delas da seguinte forma:

**Iniciativa Inicial:**

- 1: O primeiro passo é obter informações básicas no ticket ou diretamente com o usuário se fosse o caso
- 2: Identificar o escopo do problema, ex: Isso afeta todos os usuários ou é um caso isolado?
- 3: O usuário recebeu alguma confirmação (imaginando um erro na exibição de reservas criadas por exemplo) ou recebeu algum erro?

**Investigação De fora para dentro:**

- Como mencionei o mais prático e seguindo práticas de suporte ao cliente deve-se separar a investigação do problema em camadas:

- **1º Camada Frontend e cliente:** É muito importante inicialmente se colocar no lugar do usuário e ter sua visão para entender o que está acontecendo, além disso checar coisas básicas como o console e a aba de Network (para verificar as chamadas para API) assim sendo possível identificar se é um erro de renderização do Frontend por exemplo ou algo relacionado ao Backend.

- **2º Camada de Logs e Observabilidade:** Eu buscaria nos logs da aplicação pelo momento da criação daquela reserva. Verificaria também se houve algum erro silencioso ou um rollback de transação. Às vezes o banco salva o registro, mas uma integração externa falha dependendo de como a aplicação funciona e a transação é revertida.

- **3º Camada de Banco de Dados:** Aqui eu faria uma query direta ao banco de dados, buscando as seguintes possibilidades: Se a reserva está no banco, o problema é no filtro da query da listagem (ex: um `INNER JOIN` que está excluindo o registro por falta de um dado relacionado) ou se a reserva **não está no banco**, o problema foi na persistência ou no fluxo de escrita de dados.

- **4º Resolução e Prevenção:** Por fim visando qualidade e satisfação do cliente/usuário após identificar a causa raiz, minha postura não seria apenas corrigir o registro:
  - **Correção:** Aplicar o hotfix para o cliente.

  - **Prevenção:** Se for um erro de código, eu criaria um Teste de Unidade ou Integração que simulasse exatamente esse cenário para garantir que o bug nunca volte (regressão).

  - **Comunicação:** Manter o suporte/cliente informado com transparência sobre o que aconteceu e o que foi feito para prevenir.

## 2. Manutenção do Sistema:

### 1 - Arquitetura e boas práticas

Focando em manutenções futuras, escalabilidade, flexibilidade e performance eu optei por seguir uma Arquitetura em Camadas no backend e Feature-Based no frontend para garantir o desacoplamento.

- **No Backend (NestJS):** Apliquei os princípios SOLID, com foco especial na Injeção de Dependência. Isso permite que eu troque, por exemplo, o provedor de e-mail (se existisse aqui) ou o banco de dados sem precisar alterar a regra de negócio central.

- **No Frontend (React):** A organização por funcionalidades (Feature-Based) facilita a manutenção, pois todos os componentes e serviços de uma mesma tela (ex: Reservas) estão agrupados. Isso reduz a carga cognitiva de um novo desenvolvedor (muito importante haha) e evita que alterações em uma funcionalidade quebrem outras partes do sistema.

### 2 - Infra e Padronização (Docker)

- Ao invés de depender de configurações manuais no servidor, o ambiente é versionado. Isso garante que qualquer correção feita em desenvolvimento será replicada exatamente da mesma forma em produção, eliminando o erros de configuração de ambiente e agilizando o suporte técnico em caso de incidentes de infraestrutura.

### 3 - Testes Automatizados (Jest)

- A implementação de Testes Unitários com Jest no backend não é apenas para garantir a qualidade inicial, mas sim uma ferramenta de manutenção. Eles servem como uma documentação viva e uma trava de segurança: qualquer refatoração futura para melhoria de performance pode ser feita com a confiança de que as funcionalidades críticas (como o cálculo de diárias) não sofrerão regressão.

## **3. Escalabilidade**

Quando falo sobre escalabilidade gosto sempre de focar em 3 pontos que acho muito importante para um projeto realmente bem estruturado e preparado:

- **1 Escalabilidade Horizontal:** Ao invés de usar uma única máquina virtual, usaria **Docker Compose** para subir múltiplas instancias da API:
  - **Implementação de um Load Balancer** (Como NGINX ou AWS ALB) para distribuir requests entre as instâncias, evitando sobrecargas por volume de chamadas. (Nota: Esse é um assunto que venho estudando e me aprofundando bastante e gosto muito por abordar arquitetura de software)

- **2 Mensageria:** Em um sistema real como os da Economy Software criar uma reserva exige diversas tarefas (no minímo notificar por e-mail confirmações, lembretes de check-in, etc) e aí entra esse ponto que gostaria de destacar também:
  - Para evitar que o usuário espere por processos, eu implementaria uma fila de mensagens (Message Broker) usando por exemplo **RabbitMQ**.

- **3 Otimização de Banco de Dados:** É o básico mas é indispensável, como o volume de dados cresce é muito importante seguir abordagens de otimização como otimização de queries e gerenciamento de conexões simultâneas levando em conta o aumento de instâncias da API como pontuei acima.

- **4 Estratégia de Cache Mais Robusta:** O projeto atual já conta com cache, mas tratando-se de um caso real, focando em escalabilidade e performance a melhor abordagem seria garantir que o cache não seja local e sim em um **Redis** externo por exemplo para que todas as instâncias da API compartilhem as mesmas informações cacheadas.

## 4. Aprendizado e Backlog:

- A ideia do projeto é bastante alinhada a projetos reais nos quais já trabalhei, gostei muito de poder desenvolve-lo apesar de ser algo simples devido ao tempo, nele eu quis representar um pouco da identidade visual do que eu imaginei e vi pelos sites e perfis da Economy Software, desenvolvi tudo focando em entregar um pouco além do que foi solicitado no teste técnico e em entregar uma UI que garantisse uma boa UX. Dito isso destaco alguns pontos que se eu tivesse mais tempo implementaria com certeza:

     - Um chatbot (LLM) integrado com OpenRouter ou outra API para suporte básico destinado a hóspedes que em casos mais avançados redirecionaria para alguém do suporte ou recepção. (acredito que seria uma feature a se discutir em alguns casos específicos)

     - Dashboard com análise de dados úteis para gerenciamento de diversas métricas (Receita, taxa de ocupação e retenção)

     - Integração de mensageria (RabbitMQ/Kafka) para disparos transacionais reais para testes via WhatsApp e E-mail, garantindo uma comunicação fluida em cada etapa da jornada do hóspede e dos responsáveis pela reserva.

---

## 🚀 Como Rodar a Aplicação

O projeto foi **totalmente containerizado com Docker**, então você não precisa instalar Node.js, PostgreSQL, Redis ou qualquer outra dependência na sua máquina. Apenas **Docker** e **Docker Compose** são necessários.

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado e rodando.

### Passo a Passo

**1. Clone o repositório:**

```bash
git clone <url-do-repositorio>
cd CheckInn/
```

**2. Suba todos os containers com um único comando:**

```bash
docker compose up --build
```

> Isso irá construir as imagens, subir o banco de dados PostgreSQL, o Redis, a API e o Frontend automaticamente. As **migrations do banco de dados** também rodam sozinhas nesse processo.

> [!TIP]
> Ao subir, algumas seeds são rodadas para popular o banco: usuario padrao e alguns exemplos com hotel, reserva e hospedes.

**3. Acesse a aplicação no navegador:**

| Serviço  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:80   |
| API REST | http://localhost:3000 |

**4. Credenciais padrão (criadas automaticamente pelo Seed):**

| Campo   | Valor    |
| ------- | -------- |
| Usuário | `admin`  |
| Senha   | `123456` |

### Encerrando a Aplicação

```bash
docker compose down
```

> Para remover também os dados persistidos do banco:
>
> ```bash
> docker compose down -v
> ```

## 🧰 Tecnologias e Ferramentas

Aqui quero falar um pouco sobre as tecnologias e ferramentas utilizadas no projeto:

### 🔨 Backend:

O backend foi desenvolvido utilizando arquitetura modular baseada no framework NestJS, priorizando organização, escalabilidade e separação de responsabilidades.

- **Nest.js:** Framework Node.js.
- **Redis:** Utilizado como camada de cache, reduzindo a carga no banco de dados e melhorando o tempo de resposta de determinadas operações.
- **Postgres:** Banco de dados relacional utilizado para persistência dos dados da aplicação.
- **BullMQ:** Biblioteca baseada em Redis utilizada para processamento de filas. No projeto é utilizada para simular o envio assíncrono de notificações por email.
- **Swagger:** Documnentação da API
- **TypeORM:** ORM utilizado para comunicação com o banco de dados PostgreSQL.

Outras bibliotecas relevantes

- **JWT + Passport:** autenticação baseada em token.

- **Class Validator:** validação e transformação de DTOs.

- **Bcrypt:** hashing.

- **Jest:** testes automatizados.

### 💻 Frontend

O frontend foi desenvolvido utilizando **React** com **Vite**, priorizando velocidade de desenvolvimento e simplicidade de configuração.

- **React:** Biblioteca para construção de interfaces baseada em componentes reutilizáveis e gerenciamento declarativo de estado.

- **Vite:** Ferramenta de build moderna que oferece hot reload extremamente rápido durante o desenvolvimento.

- **TailwindCSS:** Framework de estilização baseado em utility classes, permitindo desenvolvimento rápido de interfaces.

- **Framer Motion:** Biblioteca utilizada para animações declarativas em React.

## Algumas Decisões Técnicas

- Utilização do NestJS para fornecer uma arquitetura organizada e escalável.
- Redis utilizado para cache e também como backend das filas do BullMQ.
- Processamento assíncrono de notificações para evitar bloqueio de requisições HTTP.
- UI trabalhada insiprando-se na identidade visual da Economy Software.

## ☕ Preview do Sistema
<img width="1366" height="1986" alt="home" src="https://github.com/user-attachments/assets/4056b175-17d8-4cb7-af2a-46e20396af1e" />
<img width="1366" height="690" alt="dashboard1" src="https://github.com/user-attachments/assets/1387ddc3-ab72-401c-b969-988662a49119" />
<img width="1366" height="620" alt="hoteis" src="https://github.com/user-attachments/assets/0a595d37-235b-4e7b-a3ce-c9eb00a25ae4" />
<img width="1366" height="620" alt="reservas" src="https://github.com/user-attachments/assets/6fb8585b-e5c2-4e5e-8ecb-265fcc3d758e" />
<img width="1366" height="620" alt="reserva-modal" src="https://github.com/user-attachments/assets/2e2c0452-025e-4891-838c-fa5a514df7df" />






