if (process.env.NODE_ENV === "development" && typeof performance !== "undefined") {
  const medir = performance.measure.bind(performance);
  performance.measure = ((nome: string, opcoes?: string | PerformanceMeasureOptions, fim?: string) => {
    try {
      return medir(nome, opcoes, fim);
    } catch (erro) {
      if (erro instanceof TypeError && /negative time stamp/.test(erro.message)) return undefined;
      throw erro;
    }
  }) as typeof performance.measure;
}
