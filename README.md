# Vitória em Foco

Webapp mobile-first para preparação de concursos públicos, combinando **planejamento de estudos, diagnóstico, gamificação e experiência interativa**.

**Demo:** https://vitoria-em-foco.lovable.app

## Visão geral

O Vitória em Foco foi concebido para transformar a preparação para concursos em uma jornada mais clara e acompanhável. Em vez de apresentar apenas listas de matérias, o produto organiza a experiência em etapas como escolha do concurso, disponibilidade de estudo, diagnóstico, cronograma, missão diária e progresso.

O projeto também explora recursos visuais e mecânicas de gamificação para tornar o acompanhamento menos parecido com um dashboard corporativo e mais próximo de uma experiência de progressão.

## Experiências implementadas

A base atual possui rotas e telas para:

- descoberta e seleção de concursos;
- detalhe de concurso;
- envio de edital;
- definição de disponibilidade de estudo;
- diagnóstico inicial;
- cronograma e planejamento;
- central do aluno;
- arena e desafios;
- biblioteca de conteúdo;
- fluxo de estudo;
- acompanhamento de progresso.

## Gamificação

A interface trabalha com elementos como:

- XP e progressão;
- missões e desafios;
- sequência de estudo;
- feedback visual de evolução;
- metas e acompanhamento até a prova.

## Stack

- React 19
- TypeScript
- TanStack Start
- TanStack Router
- TanStack Query
- Vite
- Tailwind CSS
- Three.js
- React Three Fiber
- Drei
- Framer Motion
- Zod

## Direção técnica

O projeto usa uma arquitetura baseada em rotas e componentes reutilizáveis, separando a experiência visual da camada de dados para facilitar uma futura integração com backend, banco de dados e serviços de IA.

A interface foi pensada primeiro para dispositivos móveis, mas permanece responsiva em desktop. Recursos 3D e motion são usados como parte da narrativa visual, com preocupação em não transformar a experiência em uma simples coleção de efeitos decorativos.

> A versão atual é um protótipo funcional de produto. Dados reais de concursos, processamento automático de editais, autenticação e backend completo fazem parte da evolução planejada e não são apresentados como concluídos.

## Executando localmente

```bash
git clone https://github.com/angelogabrielribeiro/vitoria-em-foco.git
cd vitoria-em-foco
npm install
npm run dev
```

## Status

**Em desenvolvimento.** A base navegável e as principais experiências de produto estão implementadas; as próximas etapas envolvem dados reais, serviços de backend e expansão do conteúdo de preparação.

## Objetivos técnicos

O projeto é utilizado para aprofundar conhecimentos em arquitetura de aplicações React, UX mobile-first, gamificação, visualização de progresso, experiências 3D no navegador e modelagem de produtos digitais com múltiplos fluxos.

---

Desenvolvido por **Angelo Gabriel Ribeiro Santos**.