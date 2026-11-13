// Code couleur commun des scores de compatibilité :
// 0–25 % rouge · 25–50 % orange · 50–75 % bleu · 75–100 % vert.
// Utilisé par les jauges des résultats du quiz et les badges de score
// du comparatif « Compose ton programme ».
export function couleurScore(score) {
  if (score >= 75) return '#2a9d3a' // vert
  if (score >= 50) return '#0096c7' // bleu
  if (score >= 25) return '#f77f00' // orange
  return '#d00000' // rouge
}
